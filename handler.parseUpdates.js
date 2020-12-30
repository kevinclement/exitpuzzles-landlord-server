let OperationHandler = require('./handler')

const AUDIO_DELAY = 3000

module.exports = class ParseUpdatesHandler extends OperationHandler {
    constructor(opts) {
        super('NOOP_PUH', opts)
    }

    operate(snapshot, cb) {
        // should be a noop since we're only listening and not speaking
        cb()
    }

    response(data) {

        let matched = false

        let patterns = [
        {
            pattern:/Ultimate Bomb Simulation by kevinc./,
            match: (m) => {

                // This means arduino rebooted, so lets reset all the state back to the
                // default.
                //
                // Based on my testing, even if the pi is offline, when you boot it 
                // the serial will flush all state changes that happened when you werent 
                // connected.  This means we can get away with always being able to write
                // state to the db, and trust that its accurate.
                //
                // NOTE: when I tried this in the room the device there did not mimic this behavior
                // so this code isn't really being triggered in real life.  Instead I'm just resetting
                // the db when bluetooth connects
                this.state.reset()
            }
        },
        {
            pattern:/KeyShooter: Shooting./,
            match: (m) => {
                this.state.updateState({keySolved: 2})
            }
        },
        {
            pattern:/Time left: (.*) Password: (.*)/,
            match: (m) => {
                this.state.updateState({
                    allSolved: 2,
                    timeLeftSolved: m[1],
                    lastBadPassword: m[2]
                });
                this.audio.play(['success.2.wav', 'success.2.wav', 'success.2.wav', 'success.2.wav'], null, AUDIO_DELAY)
            }
        },
        {
            pattern:/BOOM!!!/,
            match: (m) => {
                var state = this.state;
                this.audio.play(['bomb.wav', 'bomb.wav', 'bomb.wav', 'bomb.wav'], function() {
                    // update state in db to trigger playing from web
                    state.updateTime({
                        hours: 0,
                        minutes: 0,
                        seconds: 0,
                        timestamp: (new Date()).getTime()
                    });
                }, 100)
            }
        },
        {
            pattern:/Permanent penalty set - toggle: (\d+) wire: (\d+)/,
            match: (m) => {
                let toggle =  m[1] === "0" ? 2 : 3
                let wire =  m[2] === "0" ? 2 : 3

                this.state.updateState({
                    toggle1: toggle,
                    toggle2: toggle,
                    wire: wire
                })

                // play error for toggle (prioritize it over wires)
                if (toggle === 3) {
                    this.audio.play(['siren.wav', 'incorrectToggles.wav'], null, 1000)
                } else if (wire === 3) {
                    this.audio.play(['siren.wav', 'warningRedWire.wav'], null, 1000)
                }
            }
        },
        {
            pattern:/Permanent penalty fixed - toggle: (\d+) wire: (\d+)/,
            match: (m) => {
                let toggle =  m[1] === "0" ? 2 : 3
                let wire =  m[2] === "0" ? 2 : 3

                this.state.updateState({
                    toggle1: toggle,
                    toggle2: toggle,
                    wire: wire
                })
            }
        },
        {
            pattern:/Warning: (\d+) minutes remaining./,
            match: (m) => {
                let minutes =  m[1]
                this.state.warningTime(minutes);
            }
        },
        {
            pattern:/Invalid password tried: (.*)/,
            match: (m) => {
                this.state.updateState({
                    lastBadPassword: m[1]
                })
            }
        },
        {
            pattern:/Detected light. Turning on sound./,
            match: (m) => {
                this.state.updateState({
                    lightDetected: true
                })
            }
        }]

        // loop over all response patterns and see if one matches this handler
        patterns.forEach(p => {
            let match = p.pattern.exec(data)
            if (match) {
                p.match(match)
                matched = true
            }
        })

        return matched
    }
}