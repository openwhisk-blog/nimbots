# How to code your robots

You control your robot writing a serverless action. [Check here the source code of the sample robots](https://github.com/openwhisk-blog/nimbots/tree/master/packages/default). You can use the integrated editor to code your robot but you need to setup an account in Nimbella to play.

A serverless action is a function, written in either Javascript, Python or Go, that receive as input a json document and returns its answer in json. In each programming language the json is serialized and deserialized first in a data structure appropriate for you programming language. When you create a robot a suitable example is provided.

Each robot will communicate with the action to receive orders. The action is invoked when an event occurr.
In response to an event you return a list of orders, in the format described below.

The robot has an energy level that starts at 5 and decrease by one each time you are hit. When it reaches  `0` you lose. You lose also if your controlling actions returns an error, so be careful in your coding.

## Events 

The robot receive a message in the following format:

```
{
  "event": "idle",
  "energy": 5,
  "x": 110,
  "y": 240,
  "angle": 23
  "tank_angle": 232,
  "turret_angle": 150,
  "enemy_spot": {},
  "data": {}
}
```

-  The `event` can be:
   - `idle`:  the robot has its order queue empty and and asks for new orders 
   - `enemy-spot`: the robot has spotted the enemy and can hit him firing
   - `hit`: the robot was hit by an enemy bullet
   - `wall-collide`: the robot collided with a wall
- `x` and `y` are the position in the battlefiel, 
- `tank_angle` and `turret_angle` are the angles of the tank and of the turret in degrees. 
- `angle` is the sum of the angle of the turret and the tank, modulo 360
- `energy` is your energy level, 

When the event is `enemy_spot` there is also the field `enemy_spot` in this format: 

```
{

    "id": 1, 
    "x": 291,
    "y": 180,
    "angle": 23,
    "distance": 202,
    "energy": 1
}
```

where `x` and `y` are the enemy location, `angle` is the absolute angle to fire him, `distance` is its distance and `energy` the enemy energy level.

Lastly the `data`  field is a field that you can set with your own values with the `data` command, to save a state for further actions.

## Commands

When you receive an event you decide what to do and give orders to the robot.

The commands are an array of maps. For example:

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

For each sequential action you can also specify a parallel action, that is done at the same time as the sequential (that is: the tank can fire and move the turret while it is moving in a given direction)

The parallel actions are:

- `turn_turrent_left: <number>`: turn the turrent to the left of the given angle in degrees
- `turn_turrent_right: <number>`: turn the turrent to the right of the given angle in degrees
- `shot: true`: fires a bullet; note you can fire up to 5 bullets at the same time
- `yell: <string>`: yell a message that will be displayed in the battle field
