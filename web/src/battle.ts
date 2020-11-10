import { blank_object } from 'svelte/internal'
import { Robot, HP } from './robot'
import { AssetsLoader, degrees2radians } from './util'

//const SET_TIMEOUT = 5
const YELL_TIMEOUT = 50

interface Explosion {
  x: number
  y: number
  progress: number
}

let Assets = new AssetsLoader({
  "body": 'img/body.png',
  "body-red": 'img/body-red.png',
  "turret": 'img/turret.png',
  "radar": 'img/radar.png',
  'explosion1-1': 'img/explosion/explosion1-1.png',
  'explosion1-2': 'img/explosion/explosion1-2.png',
  'explosion1-3': 'img/explosion/explosion1-3.png',
  'explosion1-4': 'img/explosion/explosion1-4.png',
  'explosion1-5': 'img/explosion/explosion1-5.png',
  'explosion1-6': 'img/explosion/explosion1-6.png',
  'explosion1-7': 'img/explosion/explosion1-7.png',
  'explosion1-8': 'img/explosion/explosion1-8.png',
  'explosion1-9': 'img/explosion/explosion1-9.png',
  'explosion1-10': 'img/explosion/explosion1-10.png',
  'explosion1-11': 'img/explosion/explosion1-11.png',
  'explosion1-12': 'img/explosion/explosion1-12.png',
  'explosion1-13': 'img/explosion/explosion1-13.png',
  'explosion1-14': 'img/explosion/explosion1-14.png',
  'explosion1-15': 'img/explosion/explosion1-15.png',
  'explosion1-16': 'img/explosion/explosion1-16.png',
  'explosion1-17': 'img/explosion/explosion1-17.png'
})

export class Battle {

  static robots: Robot[] = []
  static explosions: Explosion[] = []
  static waiting = true
  static tracing = true
  static speed = 50

  static end_battle: (id: number) => void
  static suspend_battle: (msg: string) => void

  ctx: CanvasRenderingContext2D
  width: number
  height: number

  constructor(ctx: CanvasRenderingContext2D,
    width: number, height: number,
    end_battle: (id: number) => void,
    suspend_battle: (string) => void) {
    this.ctx = ctx
    this.width = width
    this.height = height
    Battle.end_battle = end_battle
    Battle.suspend_battle = suspend_battle
    Robot.battlefield_height = height
    Robot.battlefield_width = width
  }

  init(urls: string[]) {
    let robotAppearPosY = this.height / 2
    let robotAppearPosXInc = this.width / 3
    let robotAppearPosX = robotAppearPosXInc
    let id = 0
    Battle.robots = []
    for (let url of urls) {
      let r = new Robot(robotAppearPosX, robotAppearPosY, url)
      r.id = id++
      Battle.robots.push(r)
      // next appear position
      robotAppearPosX += robotAppearPosXInc
      if (id >= 2) {
        robotAppearPosX = Math.random() * (this.width - 100 + 20)
      }
    }
    Assets.loadAll(() => { this.draw() })
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height)
    let newRobots: Robot[] = []
    for (let robot of Battle.robots) {
      let body = robot.id == 0 ? "body" : "body-red"
      if (robot.hp <= 0) {
        Battle.explosions.push({
          x: robot.x,
          y: robot.y,
          progress: 1
        })
        continue
      } else {
        newRobots.push(robot)
      }

      this.ctx.save()
      this.ctx.translate(robot.x, robot.y)
      // draw text
      this.ctx.textAlign = "left"
      this.ctx.textBaseline = "top"
      let textX = 20
      let textY = 20
      if ((this.width - robot.x) < 100) {
        textX = -textX
        this.ctx.textAlign = "right"
      }
      if ((this.height - robot.y) < 100)
        textY = - textY
      let text = `${robot.hp}/${HP}`
      // check yelling
      if (robot.is_yell && (robot.yell_ts < YELL_TIMEOUT)) {
        this.ctx.font = "17px Verdana"
        text = robot.yell_msg
        robot.yell_ts++
      } else {
        robot.yell_ts = 0
        robot.is_yell = false
      }
      this.ctx.fillText(text, textX, textY)

      this.ctx.rotate(degrees2radians(robot.tank_angle))
      this.ctx.drawImage(Assets.get(body), -(38 / 2), -(36 / 2), 38, 36)
      this.ctx.rotate(degrees2radians(robot.turret_angle))
      this.ctx.drawImage(Assets.get("turret"), -(54 / 2), -(20 / 2), 54, 20)
      this.ctx.rotate(degrees2radians(robot.radar_angle))
      this.ctx.drawImage(Assets.get("radar"), -(16 / 2), -(22 / 2), 16, 22)
      this.ctx.restore()

      if (robot.bullets.length > 0) {
        for (let b of robot.bullets) {
          this.ctx.save()
          this.ctx.translate(b.x, b.y)
          this.ctx.rotate(degrees2radians(b.direction))
          this.ctx.fillRect(-3, -3, 6, 6)
          this.ctx.restore()
        }
      }
    }
    Battle.robots = newRobots

    for (let i of Battle.explosions) {
      let explosion = Battle.explosions.pop()
      if (explosion.progress <= 17) {
        this.ctx.drawImage(Assets.get("explosion1-" + explosion.progress), explosion.x - 64, explosion.y - 64, 128, 128)
        explosion.progress += 1
        Battle.explosions.unshift(explosion)
      }
    }
  }

  currRobots(): Robot[] { return Battle.robots }

  loop() {
    for (let robot of Battle.robots) {
      robot.update()
    }
    // check battle status
    if(Battle.explosions.length == 0 && Battle.robots.length <= 1) {
      Battle.waiting = true
      if(Battle.robots.length ==0)
        Battle.end_battle(-1)
      else
        Battle.end_battle(Battle.robots[0].id)
    }
    this.draw()
    // iterate
    if(!Battle.waiting)
      setTimeout(() => this.loop(), Battle.speed)
  }

  start() {
    Battle.waiting = false
    Battle.tracing = false
    this.loop()
  }

  trace() {
    Battle.waiting = false
    Battle.tracing = true
    this.loop()
  }
}

