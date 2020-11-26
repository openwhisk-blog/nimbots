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
  suspend_battle: (msg: string) => void

  width: number
  height: number

  suspended = true
  tracing = true
  timeout = 0

  title = ""

  constructor(
    width: number, height: number,
    end_battle: (id: number) => void,
    suspend_battle: (string) => void
  ) {
    Robot.battlefield_height = height
    Robot.battlefield_width = width
    this.width = width
    this.height = height

    this.end_battle = end_battle
    this.suspend_battle = suspend_battle
    Battle.battle = this
  }

  init(urls: string[]) {
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
      if (id >= 2) {
        robotAppearPosX = Math.random() * (this.width - 100 + 20)
      }
    }

    // inject enemies
    for (let rr of Battle.robots) {
      let enemies: Robot[] = []
      for (let r of Battle.robots)
        if (r.id != rr.id)
          enemies.push(r)
      rr.init(enemies)
    }
  }

  completed_request(msg: string, ok: boolean) {
    if (!ok || this.tracing) {
      this.suspended = true
      this.suspend_battle(msg)
    }
  }

  hit_robot(x: number, y: number) {
    Battle.explosions.push({
      x: x,
      y: y,
      progress: 1
    })
  }


  loop() {
    //console.log("suspended=", this.suspended, "tracing=", this.tracing)
    //if (this.suspended)
    //  return
    
    // update robots
    for (let robot of Battle.robots)
      robot.update()
    // check battle status 
    // are explosion finished so we can declare game over?
    if (Battle.explosions.length == 0 && Battle.robots.length <= 1) {
      if (Battle.robots.length == 0)
        this.end_battle(-1)
      else
        this.end_battle(Battle.robots[0].id)
      this.stop()
    }
    // refresh
    this.draw()
    // iterate
    if (!this.suspended)
      this.timeout = setTimeout(() => this.loop(), Battle.speed)
  }

  draw() { }

  stop() {
    this.suspended = true
    clearTimeout(this.timeout)
  }

  start() {
    this.suspended = false
    this.tracing = false
    this.loop()
    return this.title
  }

  trace() {
    this.suspended = false
    this.tracing = true
    this.loop()
    return this.title
  }
}
