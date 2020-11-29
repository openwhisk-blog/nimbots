function main(args) {
    let actions = []
    switch (args.event) {
        case "idle":
            if ("angle" in args.data) {
                // we have spotted a robot and saved the position
                let me = args.angle
                let him = args.data.angle
                // adjusting the position
                if (me > him) {
                    actions.push({ "turn_turret_left": me - him, "yell": "left " + (me - him) })
                } else {
                    actions.push({ "turn_turret_right": him - me, "yell": "right " + (him - me) })
                }
                actions.push({ "shoot": true, "data": {} })
            } else {
                // lets move forward casually
                actions.push({ "move_forwards": 10 + Math.random() * 90, "turn_turret_left": 360 })
                actions.push({ "turn_left": 10 + Math.random() * 80 })
            }
            break;
        case "wall-collide":
            actions.push({ "move_opposide": 10 })
            actions.push({ "turn_left": 90 })
            break
        case "hit":
            actions.push({ "yell": "Ooops!" })
            actions.push({ "move_forwards": 50 })
            actions.push({ "turn_left": Math.random() * 90 })
            break
        case "enemy-spot":
            let angle = args.enemy_spot.angle
            if (!("angle" in args.data)) {
                actions.push({ "yell": "Spotted at " + angle })
                actions.push({ "data": { "angle": angle } })
            }
            break
        default:
            console.log(args)
    }
    return { "body": actions }
}