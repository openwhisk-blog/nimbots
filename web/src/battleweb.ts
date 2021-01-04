import { Battle } from './battle'
import { inspector } from './store'
import { AssetsLoader } from './util'
import { Robot, HP, degrees2radians, log } from './robot'

const YELL_TIMEOUT = 50

let Assets = new AssetsLoader({
    "splash": 'img/splash.png',
    "background": 'img/background.png',
    "body": 'img/body.png',
    "body-red": 'img/body-red.png',
    "turret": 'img/turret.png',
    "turret-red": 'img/turret-red.png',
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

function inspect(id: number, counter: number, request: string, response: string) {
    inspector.update((info) => {
        if (counter !== undefined)
            info[id].n = counter;
        if (request !== undefined)
            info[id].req = request;
        if (response !== undefined)
            info[id].res = response;
        return info
    })
}

export class BattleWeb extends Battle {
    ctx: CanvasRenderingContext2D

    constructor(
        width: number, height: number,
        end_battle: (id: number) => void,
        suspend_battle: (mgs: string, state0: string, state1: string) => void
    ) {
        super(width, height, end_battle, suspend_battle)
        Assets.loadAll(() => { })
    }

    webinit(ctx: CanvasRenderingContext2D, url: string[], startAngles: number[][]) {
        this.ctx = ctx
        this.init(url, startAngles, -1)
        for (let r of Battle.robots)
            r.inspect = inspect
    }

    draw() {
        //this.ctx.clearRect(0, 0, this.width, this.height)
        this.ctx.drawImage(Assets.get("background"), 0,0,this.width,this.height)
        let newRobots: Robot[] = []
        for (let robot of Battle.robots) {
            let body = robot.id == 0 ? "body" : "body-red"
            let turret = robot.id == 0 ? "turret" : "turret-red"
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
                this.ctx.font = "18px Verdana"
                text = robot.yell_msg
                robot.yell_ts++
            } else {
                robot.yell_ts = 0
                robot.is_yell = false
            }
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillText(text, textX, textY)

            this.ctx.rotate(degrees2radians(robot.tank_angle))
            this.ctx.drawImage(Assets.get(body), -(50 / 2), -(50 / 2), 50, 50)
            this.ctx.rotate(degrees2radians(robot.turret_angle))
            this.ctx.drawImage(Assets.get(turret), -(50 / 2), -(25 / 2), 50, 25)
            this.ctx.rotate(degrees2radians(robot.radar_angle))
            //this.ctx.drawImage(Assets.get("radar"), -(16 / 2), -(22 / 2), 16, 22)
            this.ctx.restore()

            if (robot.bullets.length > 0) {
                for (let b of robot.bullets) {
                    this.ctx.save()
                    this.ctx.translate(b.x, b.y)
                    this.ctx.rotate(degrees2radians(b.direction))
                    this.ctx.fillStyle = "#FFFFFF";
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
}
