import { degrees2radians, radians2degrees, inRect, euclidDistance } from './util'
import { Battle } from './battle'

export const HP = 20
const BULLET_SPEED = 3
const MAX_BULLET = 5
const BULLET_INTERVAL = 15
const ROBOT_RADIUS = 10
const SEQUENTIAL_EVENTS = ["move_forwards", "move_backwards", "turn_left", "turn_right", "move_opposide"]

//const PARALLEL_EVENTS = ["shoot", "turn_turret_left", "turn_turret_right", "turn_radar_left", "turn_radar_right"]

interface Event {
  action: string
  msg: string
  progress: number
  amount: number
}

interface Status {
  wall_collide: boolean
  is_hit: boolean
}

interface Bullet {
  x: number
  y: number
  direction: number
}

interface Info {
  id: number
  x: number
  y: number
  hp: number
  angle: number
  tank_angle: number
  turret_angle: number
}

export class Robot {

  static battlefield_width: number = 0
  static battlefield_height: number = 0

  me: Info
  id: number = 0
  hp: number = HP

  tank_angle: number = Math.random() * 360
  turret_angle: number = Math.random() * 360
  radar_angle: number = Math.random() * 360
  event_counter: number = 0

  events: Event[] = []
  bullets: Bullet[] = []
  status: Status = {
    wall_collide: false,
    is_hit: false
  }

  is_hit = false
  is_yell = false
  yell_ts = 0
  yell_msg = undefined
  bullet_ts = 0
  enemy_spot = []
  action_to_collide = 0

  x: number
  y: number
  url: string

  constructor(x: number, y: number, url: string) {
    this.x = x
    this.y = y
    this.url = url
  }

  move(distance: number) {
    let newX = this.x + distance * Math.cos(degrees2radians(this.tank_angle));
    let newY = this.y + distance * Math.sin(degrees2radians(this.tank_angle));

    if (inRect(newX, newY, 15, 15,
      Robot.battlefield_width - 15,
      Robot.battlefield_height - 15)) {
      // hit the wall
      console.log("not-wall-collide")
      this.status.wall_collide = false
      this.x = newX
      this.y = newY
    } else {
      console.log("wall-collide")
      this.status.wall_collide = true
    }
  }

  turn(degrees: number) {
    this.tank_angle += degrees
    this.tank_angle = this.tank_angle % 360
    if (this.tank_angle < 0)
      this.tank_angle += 360
  }

  turn_turret(degrees: number) {
    this.turret_angle += degrees
    this.turret_angle = this.turret_angle % 360
    if (this.turret_angle < 0)
      this.turret_angle += 360
  }

  yell(msg: string) {
    this.is_yell = true
    this.yell_ts = 0
    this.yell_msg = msg
  }

  receive(event: Event) {
    console.log("receive",  event)
    if (event.action == "shoot") {
      if (this.bullets.length >= MAX_BULLET || this.bullet_ts < BULLET_INTERVAL) {
        return
      }
      this.bullet_ts = 0
      let bullet: Bullet = {
        x: this.x, y: this.y,
        direction: this.tank_angle + this.turret_angle
      }
      this.bullets.push(bullet)
      return
    }
    // remove duplicate events
    // FIXME improve performance
    if (event.action == "turn_turret_left")
      for (let ev of this.events)
        if (ev.action == "turn_turret_left")
          return

    if (event.action == "turn_turret_right")
      for (let ev of this.events)
        if (ev.action == "turn_turret_right")
          return

    if (event.action == "yell")
      if (this.yell_ts == 0) {
        this.yell(event.msg)
        return
      }

    event.progress = 0
    console.log("queuing receive", event)
    this.events.push(event)
  }

  async send(msg: object): Promise<boolean> {
    return fetch(this.url, {
      "method": 'POST',
      "headers": { 'Content-Type': 'application/json' },
      "body": JSON.stringify(msg)
    }).then(response => response.text()
    ).then((json) => {
      console.log(json)
      let data: Event | Array<Event> = JSON.parse(json)
      let queue: Event[]
      if (data instanceof Event) {
        queue = [data as Event]
      } else if (Array.isArray(data)) {
        queue = data
      } else {
        return false
      }
      for (let event of queue) {
        this.receive(event)
      }
      return true
    }).catch((err) => {
      alert("Cannot contact server!")
      return false
    })
  }

  get_enemy_robots(): Robot[] {
    let enemies: Robot[] = []
    for (let r of Battle.robots)
      if (r.id != this.id)
        enemies.push(r)
    return enemies
  }

  send_enemy_spot() {
    console.log("send-enemy-spot")
    this.send({
      "event": "enemy-spot",
      "me": this.me,
      "enemy-spot": this.enemy_spot,
      "status": this.status
    })
  }

  send_interruption() {
    console.log("send-interruption")
    this.send({
      "event": "interruption",
      "me": this.me,
      //"enemy-robots": @get-enempy-robots!,
      "status": this.status
    })
  }

  check_enemy_spot() {
    this.enemy_spot = []
    let is_spot = false
    for (let enemy_robot of this.get_enemy_robots()) {
      let my_angle = (this.tank_angle + this.turret_angle) % 360
      my_angle = my_angle < 0 ? my_angle : 360 + my_angle
      let my_radians = degrees2radians(my_angle)
      let enemy_position_radians = Math.atan2(enemy_robot.y - this.y, enemy_robot.x - this.x)
      let distance = euclidDistance(this.x, this.y, enemy_robot.x, enemy_robot.y)
      let radians_diff = Math.atan2(ROBOT_RADIUS, distance)

      // XXX a dirty shift
      my_radians = Math.abs(my_radians)
      if (my_radians > Math.PI)
        my_radians -= (2 * Math.PI)
      if (my_radians < -Math.PI)
        my_radians += (2 * Math.PI)

      let max = enemy_position_radians + radians_diff
      let min = enemy_position_radians - radians_diff

      //# console.log "max = #{max}"
      //# console.log "min = #{min}"
      //# console.log "my-radians = #{my-radians}"
      //# console.log "diff =" + radians-diff

      if (my_radians >= min && my_radians <= max) {
        let enemy_position_degrees = radians2degrees(enemy_position_radians)
        if (enemy_position_degrees < 0)
          enemy_position_degrees = 360 + enemy_position_degrees
        this.enemy_spot.push({ id: enemy_robot.id, angle: enemy_position_degrees, distance: distance, hp: enemy_robot.hp, x: enemy_robot.x, y: enemy_robot.y })
        is_spot = true
      }
    }
    if (is_spot)
      return true
    return false
  }

  update_bullet() {
    let i = -1
    for (let b of this.bullets) {
      i++
      b.x += BULLET_SPEED * Math.cos(degrees2radians(b.direction))
      b.y += BULLET_SPEED * Math.sin(degrees2radians(b.direction))
      let bullet_wall_collide = !inRect(b.x, b.y, 2, 2, Robot.battlefield_width - 2, Robot.battlefield_height - 2)
      if (bullet_wall_collide) {
        b = null
        this.bullets.splice(i, 1)
        continue
      }

      let j = -1
      for (let enemy_robot of this.get_enemy_robots()) {
        j++
        let robot_hit = (euclidDistance(b.x, b.y, enemy_robot.x, enemy_robot.y) < 20)
        if (robot_hit) {
          enemy_robot.hp -= 3
          enemy_robot.is_hit = true
          Battle.explosions.push({
            x: enemy_robot.x,
            y: enemy_robot.y,
            progress: 1
          })
          b = null
          this.bullets.splice(j, 1)
          break
        }
      }
    }
  }

  update() {
    this.me = {
      angle: (this.tank_angle + this.turret_angle) % 360,
      tank_angle: this.tank_angle,
      turret_angle: this.turret_angle,
      id: this.id,
      x: this.x,
      y: this.y,
      hp: this.hp
    }

    //console.log(this.me)

    let is_turning_turret = false

    if (this.bullet_ts == Number.MAX_VALUE)
      this.bullet_ts = 0
    else
      this.bullet_ts++

    if (this.bullets.length > 0)
      this.update_bullet()

    if (this.is_hit) {
      this.events = []
      this.status.is_hit = true
      this.is_hit = false
      this.send_interruption()
      return
    }

    if (this.check_enemy_spot()) {
      this.send_enemy_spot()
    }

    let has_sequential_event = false
    let newEvents = []
    //console.log(this.events)
    for (let event of this.events) {
      //console.log("inspecting", event)
      if (SEQUENTIAL_EVENTS.indexOf(event.action) != -1) {
        if (has_sequential_event) {
          continue
        }
        has_sequential_event = true
      }

      //console.log(`events[${event.event_id}] = {action=${event.action},progress=${event.progress}}`)
      if (event && event.amount > event.progress) {
        newEvents.push(event)
        //console.log("reading", event)
        switch (event.action) {
          case "move_forwards":
            event.progress++
            this.move(1)
            if (this.status.wall_collide) {
              this.action_to_collide = 1 //#forward
              newEvents = []
              this.send_interruption()
              break
            }

          case "move_backwards":
            event.progress--
            this.move(-1)
            if (this.status.wall_collide) {
              this.action_to_collide = -1 //#backward
              newEvents = []
              this.send_interruption()
              break
            }

          case "move_opposide":
            event.progress++
            this.move(-this.action_to_collide)
            if (this.status.wall_collide) {
              this.action_to_collide = -this.action_to_collide
              newEvents = []
              this.send_interruption()
              break
            }

          case "turn_left":
            event.progress++
            this.turn(-1)

          case "turn_right":
            event.progress++
            this.turn(1)

          case "turn_turret_left":
            if (is_turning_turret)
              continue
            event.progress++
            this.turn_turret(-1)
            is_turning_turret = true

          case "turn_turret_right":
            if (is_turning_turret)
              continue
            event["progress"]++
            this.turn_turret(1)
            is_turning_turret = true
        }
      }
    }
    this.events = newEvents
    // notify idle
    if (this.events.length == 0)
      this.send({
        "event": "idle"
      })
  }
}
