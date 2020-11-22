package main

import "fmt"

// Main is the robot handler
func Main(args map[string]interface{}) map[string]interface{} {
	res := make([]map[string]interface{}, 0)
	switch args["event"].(string) {
	case "idle":
		res = append(res, map[string]interface{}{
			"turn_turret_right": 45,
			"move_forwards":     50,
		})
		res = append(res, map[string]interface{}{
			"turn_right": 90,
		})
	case "wall-collide":
		res = append(res, map[string]interface{}{
			"move_opposide": 10,
		})
		res = append(res, map[string]interface{}{
			"turn_left": 90,
		})
	case "hit":
		res = append(res, map[string]interface{}{
			"yell": "Ooops!",
		})
	case "enemy-spot":
		res = append(res, map[string]interface{}{
			"yell":  "Fire",
			"shoot": true,
		})
	default:
		fmt.Printf("%v\n", args)
	}
	return map[string]interface{}{"body": res}
}
