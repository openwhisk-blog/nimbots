function main(args) {
    let res = []
    switch (args.event) {
        case "idle":
            res.push({
                "move_forwards": 50,
                "shoot": true
            })
            res.push({
                "move_backwards": 50,
                "turn_turret_right ": 180,
                "shoot": true
            })
            break;
        case "wall-collide":
            res.push({ "move_opposide": 10 })
            res.push({ "turn_left": 90 })
            res.push({ "move_forward": 100 })
            break
        case "hit":
            res.push({
                "yell": "Ooops",
                "move_backwards": 100,
                "shoot": true
            })
            break
        case "enemy-spot":
            res.push({
                "yell": "Fire!",
                "shoot": true
            })
            break
        default:
            console.log(args)
    }
    return { "body": res }
}