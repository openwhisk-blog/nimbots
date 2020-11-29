function main(args) {
    let res = []
    switch(args.event) {
        case "idle":
            res.push({"turn_turret_right": 45})
            break;
        case "hit":
            res.push({"yell": "ooops!"})
            break
        case "enemy-spot":
            res.push({"shoot": true})
            break
        default:
            console.log("unexpected event", args)        
    }
    return { "body": res}
}