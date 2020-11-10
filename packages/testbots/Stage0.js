function main(args) {
    let res = []
    switch(args.action) {
        case "idle":
            res = [{
                "action":"turn_turret_right",
                "amount": 45
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
            console.log(arg)        
    }
    return { "body": res}
}