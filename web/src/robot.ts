
export const HP = 5

export function degrees2radians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function radians2degrees(radians: number): number {
  return radians * (180 / Math.PI)
}

export function euclidDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

export function inRect(x1: number, y1: number, x2: number, y2: number, width: number, height: number) {
  return (x2 + width) > x1 && x1 > x2 && (y2 + height) > y1 && y1 > y2
}


class Logger {

  requestOn: false
  request(...args: any[]) {
    if (this.requestOn)
      console.log("request:", ...args)
  }

  actionOn: false
  action(...args: any[]) {
    if (this.actionOn)
      console.log("action:", ...args)
  }

  eventOn: false
  event(...args: any[]) {
    if (this.eventOn)
      console.log("event:", ...args)
  }
}

export let log = new Logger()

const BULLET_SPEED = 3
const MAX_BULLET = 5
const BULLET_INTERVAL = 50
const ROBOT_RADIUS = 25

interface Event {
  action?: string
  msg?: string
  progress?: number
  amount?: number
  yell?: string
  shoot?: boolean
  turn_left?: number
  turn_right?: number
  move_forwards?: number
  move_backwrds?: number
  move_opposide?: number
  turn_turret_left?: number
  turn_turret_right?: number
  data?: any
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
  data: object = {}
  id: number = 0
  hp: number = HP

  tank_angle: number = 0// Math.random() * 360
  turret_angle: number = 90 //Math.random() * 360
  radar_angle: number = this.turret_angle; //Math.random() * 360
  event_counter: number = 0

  events: Event[] = []
  bullets: Bullet[] = []
  status: Status = {
    wall_collide: false,
    is_hit: false
  }

  is_hit = false
  is_yell = false
  is_spot = false
  yell_ts = 0
  yell_msg = undefined
  bullet_ts = 0
  enemy_spot = {}
  action_to_collide = 0
  waiting_for_response = false
  just_spotted = false

  x: number
  y: number
  url: string

  enemies: Robot[] = []

  completed_request: (msg: string, ok: boolean) => void
  hit_robot: (x: number, y: number) => void
  inspect: (id: number, counter: number, request: string, response: string) => void = function() {}

  constructor(x: number, y: number, url: string,
    completed_request: (msg: string, ok: boolean) => void,
    hit_robot: (x: number, y: number) => void) {
    this.x = x
    this.y = y
    this.url = url
    this.completed_request = completed_request
    this.hit_robot = hit_robot
  }

  init(enemies: Robot[]) {
    this.enemies = enemies
  }

  move(distance: number) {
    log.action(this.id, "move", distance)
    let newX = this.x + distance * Math.cos(degrees2radians(this.tank_angle));
    let newY = this.y + distance * Math.sin(degrees2radians(this.tank_angle));

    if (inRect(newX, newY, 15, 15,
      Robot.battlefield_width - 15,
      Robot.battlefield_height - 15)) {
      // hit the wall
      //console.log("not-wall-collide")
      this.status.wall_collide = false
      this.x = newX
      this.y = newY
    } else {
      //console.log("wall-collide")
      this.status.wall_collide = true
    }
  }

  turn(degrees: number) {
    log.action(this.id, "turn", degrees)
    this.tank_angle += degrees
    this.tank_angle = this.tank_angle % 360
    if (this.tank_angle < 0)
      this.tank_angle += 360
  }

  turn_turret(degrees: number) {
    log.action(this.id, "turn_turret", degrees)
    this.turret_angle += degrees
    this.turret_angle = this.turret_angle % 360
    if (this.turret_angle < 0)
      this.turret_angle += 360
  }

  yell(msg: string) {
    log.action(this.id, "yell", msg)
    this.is_yell = true
    this.yell_ts = 0
    this.yell_msg = msg
  }

  async send(msg: object): Promise<boolean> {
    let json = JSON.stringify(msg, null, 2)
    ++this.event_counter
    this.inspect(this.id, this.event_counter, json, undefined)
    log.event(msg)
    this.waiting_for_response = true
    return fetch(this.url, {
      "method": 'POST',
      "headers": { 'Content-Type': 'application/json' },
      "body": json
    }).then(response => {
      if (response.ok)
        return response.text()
      throw "Broken Robot Controller"
    }).then((json) => {
      //console.log(json)  
      this.waiting_for_response = false
      let newEvents = []
      for (let event of this.decode(json)) {
        event.progress = 0
        log.request(this.id, event)
        newEvents.push(event)
      }
      this.events = newEvents
      //console.log(newEvents)
      // stop after this sendrec
      this.completed_request("Round completed.", true)
      return true
    }).catch((err) => {
      this.waiting_for_response = false
      console.log(err)
      this.completed_request("ERROR: " + err, false)
      return false
    })
  }

  async send_event(event): Promise<boolean> {
    return this.send({
      "event": event,
      "energy": this.hp,
      "x": Math.floor(this.me.x),
      "y": Math.floor(this.me.y),
      "angle": Math.floor(this.me.angle),
      "tank_angle": Math.floor(this.me.tank_angle),
      "turret_angle": Math.floor(this.me.turret_angle),
      "enemy_spot": this.enemy_spot,
      "data": this.data
    })
  }

  check_enemy_spot() {
    this.enemy_spot = {}
    let is_spot = false
    for (let enemy_robot of this.enemies) {
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

      if (my_radians >= min && my_radians <= max) {
        let enemy_position_degrees = radians2degrees(enemy_position_radians)
        if (enemy_position_degrees < 0)
          enemy_position_degrees = 360 + enemy_position_degrees
        this.enemy_spot = {
          //id: enemy_robot.id, 
          x: Math.floor(enemy_robot.x),
          y: Math.floor(enemy_robot.y),
          angle: Math.floor(enemy_position_degrees),
          distance: Math.floor(distance),
          energy: enemy_robot.hp,
        }
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
      for (let enemy_robot of this.enemies) {
        j++
        let robot_hit = (euclidDistance(b.x, b.y, enemy_robot.x, enemy_robot.y) < 20)
        if (robot_hit) {
          enemy_robot.hp -= 1
          enemy_robot.is_hit = true
          this.hit_robot(enemy_robot.x, enemy_robot.y)
          b = null
          this.bullets.splice(j, 1)
          break
        }
      }
    }
  }

  async update() {
    //console.log("update")
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
    if (this.bullet_ts == Number.MAX_VALUE)
      this.bullet_ts = 0
    else
      this.bullet_ts++

    if (this.bullets.length > 0)
      this.update_bullet()

    // parallel actions
    let already_turned = false
    for (let event of this.events) {
      switch (event.action) {
        case "shoot":
          //console.log("par event", this.id,  event.action)
          if (this.bullets.length >= MAX_BULLET || this.bullet_ts < BULLET_INTERVAL) {
            continue
          }
          event.progress = 1
          this.bullet_ts = 0
          let bullet: Bullet = {
            x: this.x, y: this.y,
            direction: this.tank_angle + this.turret_angle
          }
          this.bullets.push(bullet)
          continue
        case "data":
          //console.log(this.id, "par", event.action)
          this.data = event.data
          event.progress = 1
          continue
        case "yell":
          //console.log(this.id, "par", event.action)
          if (this.yell_ts == 0) {
            this.yell(event.msg)
          }
          event.progress = 1
          continue
        case "turn_turret_left":
          //console.log(this.id, "par", event.action)
          if (!already_turned) {
            event.progress++
            this.turn_turret(-1)
            already_turned = true
          }
          continue
        case "turn_turret_right":
          //console.log(this.id, "par", event.action)
          if (!already_turned) {
            event.progress++
            this.turn_turret(1)
            already_turned = true
          }
          continue
      }
    }

    // sequential actions
    let newEvents = []
    //console.log("processing seq", this.events)
    let processed = false
    loop: for (let event of this.events) {
      if (event.progress < event.amount) {
        //console.log("keeping", event.action)
        newEvents.push(event)
      } else {
        //console.log("dropping", event.action)
        continue
      }
      // handle parallel action
      if (!processed)
        switch (event.action) {
          case "move_forwards":
            //console.log("sequential", this.id, event.action)
            event.progress++
            this.move(1)
            if (this.status.wall_collide) {
              this.action_to_collide = 1 //#forward
            }
            processed = true
            break
          case "move_backwards":
            //console.log(this.id, "seq", event.action)
            event.progress++
            this.move(-1)
            if (this.status.wall_collide) {
              this.action_to_collide = -1 //#backward
            }
            processed = true
            break
          case "move_opposide":
            //console.log(this.id, "seq", event.action)
            event.progress++
            this.move(-this.action_to_collide)
            if (this.status.wall_collide) {
              this.action_to_collide = -this.action_to_collide
            }
            processed = true
            break
          case "turn_left":
            //console.log(this.id, "seq", event.action)
            event.progress++
            this.turn(-1)
            processed = true
            break
          case "turn_right":
            //console.log(this.id, "seq", event.action)
            event.progress++
            this.turn(1)
            processed = true
            break
        }
    }
    this.events = newEvents

    // check if we spotted the enemy
    if (!this.is_spot && this.check_enemy_spot()) {
      this.is_spot = true
      console.log("spotted!")
    }

    if (!this.waiting_for_response) {
      // check if spotted enemy
      if (this.is_spot && !this.just_spotted) {
          console.log("sending spot")
          this.is_spot = false
          this.just_spotted = true
          await this.send_event("enemy-spot")
          return
      }

      if (this.is_hit) {
        this.status.is_hit = true
        this.events = []
        await this.send_event("hit")
        this.just_spotted = false
        this.is_hit = false
        return
      }

      // check collision
      if (this.status.wall_collide) {
        this.events = []
        await this.send_event("wall-collide")
        this.just_spotted = false
        return
      }

      // notify idle
      if (this.events.length == 0) {
        // check if it is hit
        await this.send_event("idle")
        this.just_spotted = false
        return
      }
    }
  }

  actions = [
    "move_forwards",
    "move_backwards",
    "move_opposide",
    "turn_left",
    "turn_right",
    "turn_turret_left",
    "turn_turret_right",
    "yell",
    "shoot",
    "data"
  ]

  checkEvent(event: object) {
    for (let key in event) {
      if (this.actions.indexOf(key) == -1)
        return "ERROR! '" + key + "' ???"
    }
    return ""
  }

  decode(json: string): Event[] {
    let data: Event | Array<Event> = JSON.parse(json)
    this.inspect(this.id, this.event_counter, undefined, JSON.stringify(data, null, 2))
    let events: Event[]
    let res: Event[] = []
    if (data instanceof Event) {
      events = [data as Event]
    } else if (Array.isArray(data)) {
      events = data
    } else {
      events = []
    }
    // expand commands
    for (let event of events) {
      // it is an action
      if ("action" in event) {
        res.push(event)
        continue
      }
      let err = this.checkEvent(event)
      if (err != "") {
        res.push({
          "action": "yell",
          "msg": err,
          "amount": 1
        })
        console.log(err)
      }
      // short form
      if ("data" in event) {
        res.push({
          "action": "data",
          "data": event["data"],
          "amount": 1
        })
      }
      if ("yell" in event) {
        res.push({
          "action": "yell",
          "msg": event["yell"],
          "amount": 1
        })
      }
      if ("shoot" in event) {
        if (event.shoot)
          res.push({
            "action": "shoot",
            "amount": 1
          })
      }
      // left or right but not both
      if ("turn_turret_right" in event) {
        res.push({
          "action": "turn_turret_right",
          "amount": event["turn_turret_right"]
        })
      } else if ("turn_turret_left" in event) {
        res.push({
          "action": "turn_turret_left",
          "amount": event["turn_turret_left"]
        })
      }
      // sequential actions
      if ("move_opposide" in event) {
        res.push({
          "action": "move_opposide",
          "amount": event["move_opposide"]
        })
        continue
      }
      if ("move_forwards" in event) {
        res.push({
          "action": "move_forwards",
          "amount": event["move_forwards"]
        })
        delete event["move_forwards"]
        continue
      }
      if ("move_backwards" in event) {
        res.push({
          "action": "move_backwards",
          "amount": event["move_backwards"]
        })
        delete event["move_backwards"]
        continue
      }
      if ("turn_left" in event) {
        res.push({
          "action": "turn_left",
          "amount": event["turn_left"]
        })
        delete event["turn_left"]
        continue
      }
      if ("turn_right" in event) {
        res.push({
          "action": "turn_right",
          "amount": event["turn_right"]
        })
        continue
      }
    }
    return res
  }
}
