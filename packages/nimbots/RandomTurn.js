function main(args) {
    let res = []
    switch (args.event) {
        case "idle":
            res.push({
                "turn_right": 20,
                "turn_turret_right": 30
            })
            if(Math.random()>0.5)
                res.push({"turn_right": 30})
            else
                res.push({"turn_left": 30})
            break;
        case "wall-collide":
            res.push({ "move_opposide": 10 })
            res.push({ "turn_left": 90 })
            break
        case "hit":
            res.push({
                "turn_right": 30,
                "move_forwards": 50
            })
            break
        case "enemy-spot":
            res.push({"shoot": true})
            break
        default:
            console.log("unexpected event", args)     
    }
    return { "body": res }
}