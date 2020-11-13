def main(args):
    res = []
    ev = args["event"] if "event" in args else ""
    if ev == "idle":
        res.append({"turn_turret_right": 45, "move_forwards": 50})
        res.append({"turn_right": 90})
    elif ev == "wall-collide":
        res.append({"move_opposide":10})
        res.append({"turn_left":90})
    elif ev == "hit":
        res.append({"yell": "Ooops!"})
    elif ev == "enemy-spot":
         res.append({"yell": "Fire!", "shoot":True})
    else:
        print(args)
    return {"body": res}

