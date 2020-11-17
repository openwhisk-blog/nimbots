function main(args){
    let actions = []
    switch(args.event) {
        case "idle":
            actions.push({"turn_turret_left": 45, "move_forwards": 50})
            actions.push({"turn_left": 45})
            break;
        case "wall-collide":
            actions.push({"move_opposide":10})
            actions.push({"turn_left":90})
            break
        case "hit":
            actions.push({"yell": "Ooops!"})
            break
        case "enemy-spot":
            actions.push({"yell": "Fire!", "shoot":true})
            break
        default:
            console.log("unexpectd event", args)
    }
    return { "body": actions}
}