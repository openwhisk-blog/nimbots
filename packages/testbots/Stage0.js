function main(args) {
    let res = []
    switch(args.event) {
        case "idle":
            res = [{
                "action":"turn_turret_right",
                "amount": 5
            }]
            break;
        case "hit":
            res = [{
                "action": "yell",
                "msg": "ooops!"
            }]
            break
        case "enemy-spot":
            res = [{"action": "shoot"}]
            break
        default:
            console.log(args.on)        
    }
    return { "body": res}
}