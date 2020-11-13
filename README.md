# Nimbots!

Welcome to Nimbots, a programming game based on Nimbella.

You play Nimbots just coding your robot as a serverless action.

Your robot can then fight aginst other robots in the [Nimbots Arena](https://msciabgm-3h6qwxvwpw2-apigcp.nimbella.io/)!

# How to code your robots

A robot will invoke an action communicating his state to receive orders. The action is invoke either when something happens (currently when the robot is hit by a bullet (event `hit`), it spots an enemy (event `enemy-spot`, it hits a wall (event `wall-collide`)) or it has notihing to do and asks for orders (event `idle`).

## Events 

Your controlling actions to receive orders will receive a message in the following format:

```
{
  "event": "idle",
  "energy": 5,
  "x": 110.08943883378159,
  "y": 240.55490761839846,
  "tank_angle": 310.0539299299875,
  "turret_angle": 260.24915928062995,
  "enemy_spot": {},
  "data": {}
}
```

Note that: 

- the `event` can either `idle`, `enemy-spot`, `wall-collide` or `hit`.
- `x` and `y` are the position in the battlefiel,  `tank_angle` and `turret_angle` are the angles of the tank and of the turret  degrees. 
- `energy` is your energy level, starts with  5 and decrease by one each time you are hit. When it reaches  `0` you are dead.


When the event is `enemy_spot` there is also the field `enemy_spot` in this format: 

```
{
    "x": 291.17303890072367,
    "y": 180.26484144952053,
    "angle": 23.71026376973935,
    "distance": 202.39847789214505,
    "energy": 1
}
```

where `x` and `y` are the enemy location, `angle` its relative angle, `distance` is its distance and `energy` the enemy energy level.


Lastly the `data`  field is a field that you can set with your own values with the `data` command to save a state for further actions.

## Commands

When you receive an event you decide what to do and give orders to the robot.

The commands are a json in the form of an array of maps. For example:

```
[{
    "move_forwards": 50,
    "shoot": true
 },
 {
  "move_backwards": 50,
  "turn_turret_right": 180,
  "shoot": true
}]
```

Each map must contains one (and only one) key/value entry describing a sequential action. If you specify more than one sequential action, only one will be executed (and we do not tell you which one, so do not do it!).

The sequential actions are:

- `move_forwads: <number>`:  move forward of the given number of pixels
- `move_backwards: <number>`: move backwards of the given number of pixels
- `move_opposide: <number>`: move in the opposite direction of where you were moving - useful when you hit a wall
- `turn_left: <number>`: turn the tanks to the left of the given angle in degrees
- `turn_right: <number>`: turn the tanks to the right of the given angle in degrees

For each sequential action you can also specify a parallel action, that is done at the same time as the sequential (that is the tank can fire and move the turret while it is moving in a given direction)

The parallel actions are:

- `turn_turrent_left: <number>`: turn the turrent to the left of the given angle in degrees
- `turn_turrent_right: <number>`: turn the turrent to the right of the given angle in degrees
- `shot: true`: fires a bullet; note you can fire up to 5 bullets at the same time
- `yell: <string>`: yell a message that will be displayed in the battle field

You can code your actions in any programming language supported by Nimbella. Check 

