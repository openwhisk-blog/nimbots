function main(args) {
    let res = []
    console.log(args)
    switch(args.event) {
        case "idle":
            res.push({
                "action":"turn_turret_right",
                "amount": 45
            })
            break;
        case "hit":
            res.push({
                "action": "yell",
                "msg": "ooops!"
            })
            break
        case "enemy-spot":
            res.push({"action": "shoot"})
            break
        default:
            console.log(args.on)
    }
    return { "body": res}
}