function main(args) {
    let actions = []
    switch (args.event) {
        case "idle":
            actions.push({
                "move_forwards": 50,
                "shoot": true
            })
            actions.push({
                "move_backwards": 50,
                "turn_turret_right": 180,
                "shoot": true
            })
            break;
        case "wall-collide":
            actions.push({ "move_opposide": 10 })
            actions.push({ "turn_left": 90 })
            actions.push({ "move_forwards": 100 })
            break
        case "hit":
            actions.push({
                "yell": "Ooops!",
                "move_backwards": 100,
                "shoot": true
            })
            break
        case "enemy-spot":
            actions.push({
                "yell": "Fire!",
                "shoot": true
            })
            break
        default:
            console.log("unexpected event", args)
    }
    return { "body": actions }
}