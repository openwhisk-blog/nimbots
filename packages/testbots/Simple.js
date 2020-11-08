function main(args) {
    let res 
    switch(args.on) {
        case "idle":
            res = {"turn_turret_right": 45}
            break;
        case "enemySpot":
            res = {"shoot": true}
            break
        case "hit":
            res = {"yell": "Ooops!"}
            break
        default:
            console.log(args.on)        
    }
    return { "body": res}
}