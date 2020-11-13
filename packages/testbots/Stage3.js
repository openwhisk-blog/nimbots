function main(args) {
    let res = []
    let data = args.data
    // init data if needed
    if(!data)
        data = {}
    if(!data.idle_count)
        data.idle_count = 0
    if(!data.my_var_enemy)
        data.my_var_enemy = []
    switch(args.event) {
        case "idle":
            data.idle_count++
            let my_angle = args.me.angle % 360
            if(data.my_var_enemy.length > 0) {
                let forward = false
                let tiny_mode = Math.random() * 45
                let tiny_shot = Math.random() * 10
                let left_dist = my_angle + 360 * data.my_var_enemy[0].angle
                if(left_dist > 360)
                    left_dist -= 360
                let right_dist = data.my_var_enemy[0].angle - my_angle
                if(right_dist < 0)
                    right_dist = 360 + right_dist
                
                if(left_dist != right_dist) {
                    if(Math.random() >0.5) {
                        forward = true
                    }
                    if(left_dist > right_dist)
                        res.push({"turn_turret_right": right_dist+5+tiny_shot})
                    else
                        res.push({"turn_turret_left": left_dist+5+tiny_shot})
                
                    if(forward) 
                        res.push({"move_forwards": tiny_move})
                    else
                        res.push({"move_backwards": tiny_move})
                }
                res.push({"shoot":true})
                data.my_var_enemy = []
            } else {
                if(data.idle_count <5) {
                    res.push({"turn_turret_right": 45})
                    res.push({"turn_right": 15})
                    res.push({"move_forwards": 25})
                } else {
                    res.push({"turn_turret_left":30})
                    res.push({"turn_left":30})
                    res.push({"move_forwards":Math.random()*50+10})
                }
            }
            break;
        case "hit":
            data.idle_count=0
            res.push({"yell": "No!"})
            break
        case "enemy-spot":
            data.my_var_enemy = args.enemy_spot
            res.push({"shoot": true})
            res.push({"yell": "enemy spotted"})
            data.idle_count = 0
            break
        default:
            console.log("unexpected event", args)         
    }
    res.push({"data": data})
    return { "body": res}
}