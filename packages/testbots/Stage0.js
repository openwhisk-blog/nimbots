function main(args) {
    let res = []
    switch (args.event) {
        case "idle":
            res.push({
                "action": "turn_turret_right",
                "amount": 45
            })
            break;
        case "hit":
            res.push({ "yell": "Ooops" })
            break
        case "enemy-spot":
            res.push({ "action": "shoot" })
            break
        case "wall-collide":
            res.push({ "move_opposide": 10 })
            res.push({ "turn_left": 90 })
            res.push({ "move_forwards": 100 })
        default:
            console.log(args.on)
    }
    return { "body": res }
}