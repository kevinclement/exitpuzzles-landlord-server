# Current set of strings being emitted from arduino

## status updates

```
// from incorrect code
"Penalty!"
"Invalid password tried: 419268028453464"
"Done with penalty"

// wires solved
"KeyShooter: Shooting."

// trunk open
"Detected light. Turning on sound."

// end of game (winner)
"They WON!"
"Time left: 01:02:03"

// end of game (lose)
"BOOM!!!"

// penalty 
"Permanent penalty set - toggle: 0 wire: 1"

// misc
"Key is out, turning off solenoid to reduce heat."
```

## responses to set/gets
```
"reset entered"
"setting time to 1:2:3"
"current time: 01:02:03"
"Overriding key shooter, shooting now."
"Showing error that wires are incorrect."
"Turning off bad wire penalty."
"Turning off toggle penalty."
"Status: "
"  toggle1: 0"
"  toggle2: 0"
"  wire: 0"
"  key solved: 0"
"  all done: 0"
```

## help
```
"Available commands:"
"  reset         - resets the bomb back to start"
"  time          - print how much time is left on the bomb"
"  set HH:MM:SS  - set the time on the bomb to hours (HH), minutes (MM), and seconds (SS)"
"  key           - override and trigger release of key"
"  stop          - override that will turn off toggle error and penalty"
"  stopwire      - override that will turn off bad wire error and penalty"
"  wires         - trigger an error that wires are incorrect"
"  status        - check some internal state"
```