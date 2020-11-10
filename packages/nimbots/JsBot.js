function main(args) {
    let res = []
    switch(args.event) {
        case "idle":
            res.push({"turn_turret_right": 45, "move_forwards": 50})
            res.push({"turn_right": 90})
            break;
        case "wall-collide":
            res.push({"move_opposide":10})
            res.push({"turn_left":90})
            break
        case "hit":
            res.push({"yell": "Ooops!"})
            break
        case "enemy-spot":
            res.push({"yell": "Fire!", "shoot":true})
            break
        default:
            console.log(args)
    }
    return { "body": res}
}