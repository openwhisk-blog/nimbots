function main(args) {
    let res = "please specify an event"
    switch(args.action) {
        case "idle":
            res = [
              {"turn_right": 90},
              {"turn_turret_left": 10},
              {"turn_right": 90}
            ]
            break;
        case "wallCollide":
            res = [
                {"move_opposide": 10},
                {"turn_right": 90}
            ]
        case "enemySpot":
            res = {"shoot": true}
            break
        default:
            console.log(args.on)     
    }
    return { "body": res}
}