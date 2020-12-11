import { Robot, HP, degrees2radians, log } from './robot'

interface Explosion {
  x: number
  y: number
  progress: number
}

export class Battle {

  static battle: Battle
  static robots: Robot[] = []
  static explosions: Explosion[] = []
  static speed = 10

  end_battle: (id: number) => void
  suspend_battle: (msg: string, state0: string, state1: string) => void

  width: number
  height: number

  suspended = true
  tracing = true
  timeout: any = 0
  duration: number = -1

  title = ""

  constructor(
    width: number, height: number,
    end_battle: (id: number) => void,
    suspend_battle: (msg: string, state0: string, state1: string) => void
  ) {
    Robot.battlefield_height = height
    Robot.battlefield_width = width
    this.width = width
    this.height = height

    this.end_battle = end_battle
    this.suspend_battle = suspend_battle
    Battle.battle = this
  }

  init(urls: string[], startAngles: number[][], duration: number) {
    this.duration = duration
    this.title = urls[0].split("/").pop() + " vs " + urls[1].split("/").pop()
    // calculate appearing position
    let robotAppearPosY = this.height / 2
    let robotAppearPosXInc = this.width / 3
    let robotAppearPosX = robotAppearPosXInc
    let id = 0
    Battle.robots = []
    for (let url of urls) {
      let r = new Robot(robotAppearPosX, robotAppearPosY, url,
        (msg: string, ok: boolean) => { this.completed_request(msg, ok) },
        (x: number, y: number) => { this.hit_robot(x, y) })
      r.id = id++
      Battle.robots.push(r)
      // next appear position
      robotAppearPosX += robotAppearPosXInc
      //robotAppearPosY += 100
      if (id >= 2) {
        robotAppearPosX = Math.random() * (this.width - 100 + 20)
      }
    }

    // inject enemies
    let i = 0
    for (let rr of Battle.robots) {
      let enemies: Robot[] = []
      for (let r of Battle.robots)
        if (r.id != rr.id)
          enemies.push(r)
      rr.init(enemies, startAngles[i][0], startAngles[i][1])
      i++
    }
  }

  robotState(i: number) {
    // if battle is over do not return state
    if (Battle.robots.length != 2) {
      return ""
    }
    return Battle.robots[i].state()
  }

  robotName(i: number) {
    if (Battle.robots.length != 2) {
      return ""
    }
    return Battle.robots[i].name
  } 

  completed_request(msg: string, ok: boolean) {
    if (!ok) {
      this.suspended = true
      this.suspend_battle(msg, this.robotState(0), this.robotState(1))
    }
  }

  hit_robot(x: number, y: number) {
    Battle.explosions.push({
      x: x,
      y: y,
      progress: 1
    })
  }

  async loop() {
    // update robots
    for (let robot of Battle.robots) {
      robot.update().then((ok) => {
        if (!ok) {
          this.stop()
          this.end_battle(robot.id == 0 ? 1 : 0)
        }
      })
    }

    // refresh
    this.draw()
    log.state(this.duration, this.robotState(0), this.robotState(1))

    // is the battle over?
    this.duration--
    if (this.duration == 0) {
      // end battle with a draw
      this.end_battle(-1)
      this.stop()
      return
    }

    // check battle status 
    // are explosion finished so we can declare game over?
    if (Battle.explosions.length == 0 && Battle.robots.length <= 1) {
      if (Battle.robots.length == 0)
        this.end_battle(-1)
      else
        this.end_battle(Battle.robots[0].id)
      this.stop()
    }

    // iterate
    if (this.tracing) {
      this.suspend_battle("Tracing... (suspended)", this.robotState(0), this.robotState(1))
      return
    }

    if (!this.suspended)
      this.timeout = setTimeout(() => this.loop(), Battle.speed)
  }

  draw() {
    // update robots removing when dead
    let newRobots: Robot[] = []
    for (let robot of Battle.robots) {
      if (robot.hp > 0)
        newRobots.push(robot)
    }
    Battle.robots = newRobots

    // handle pseudo explosions
    for (let i of Battle.explosions) {
      let explosion = Battle.explosions.pop()
      if (explosion.progress <= 17) {
        explosion.progress += 1
        Battle.explosions.unshift(explosion)
      }
    }
  }

  stop() {
    this.suspended = true
    clearTimeout(this.timeout)
  }

  terminate() {
    this.stop()
    this.end_battle(-2)
  }

  start() {
    this.suspended = false
    this.tracing = false
    this.loop()
    return this.title
  }

  trace() {
    this.suspended = true
    this.tracing = true
    this.loop()
    return this.title
  }
}
