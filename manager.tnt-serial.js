let Manager = require('./manager.serial')
let TNTState = require('./TNTState')
const EVENTS = require('./events');

module.exports = class TntManager extends Manager {
    constructor(opts) {
        let incoming = [];
        let handlers = {};

        let ref = opts.fb.db.ref('landlord/devices/tnt')

        super({ 
            ...opts,
            ref: ref,
            dev:'/dev/ttyTNT',
            baudRate: 115200,
            handlers: handlers,
            incoming:incoming,
        })

        this.EE = opts.EE;
        this.audio = opts.audio;

        // setup supported commands
        handlers['tnt.refreshTime'] = (s,cb) => {
          this.write('status', err => {
            if (err) {
              s.ref.update({ 'error': err });
            }
            cb()
          });
        }

        // setup supported device output parsing
        incoming.push(
        {
            pattern:/.*status=(.*)/,
            match: (m) => {
                // Use a parsed object so I can look at the parsing as a whole and not rely on ordering
                let newState = new TNTState();

                m[1].split(',').forEach((s)=> {
                    let p = s.split(/:(.+)/);
                    switch(p[0]) {
                        case "version": 
                            newState.version = p[1]
                            break
                        case "gitDate": 
                            newState.gitDate = p[1]
                            break 
                        case "buildDate": 
                            newState.buildDate = p[1]
                            break
                            
                        case "time":
                            let tm = /(\d+):(\d+):(\d+)/.exec(p[1]);
                            if (tm) {
                                newState.time.hours = parseInt(tm[1])
                                newState.time.minutes = parseInt(tm[2])
                                newState.time.seconds = parseInt(tm[3])
                                newState.time.timestamp = (new Date()).getTime()
                            }
                            break

                        case "toggle1":
                            newState.toggles.toggle1 = (p[1] === 'true')
                            break
                        case "toggle2":
                            newState.toggles.toggle2 = (p[1] === 'true')
                            break
                        case "toggle3":
                            newState.toggles.toggle3 = (p[1] === 'true')
                            break
                        case "toggle4":
                            newState.toggles.toggle4 = (p[1] === 'true')
                            break
                        case "toggle5":
                            newState.toggles.toggle5 = (p[1] === 'true')
                            break
                        case "togglesFailing":
                            newState.toggles.failing = (p[1] === 'true')
                            break
                        case "overrideToggles":
                            newState.toggles.override = (p[1] === 'true')
                            break
                        
                        case "wire1":
                            newState.wires.wire1 = (p[1] === 'true')
                            break
                        case "wire2":
                            newState.wires.wire2 = (p[1] === 'true')
                            break
                        case "wire3":
                            newState.wires.wire3 = (p[1] === 'true')
                            break
                        case "wire4":
                            newState.wires.wire4 = (p[1] === 'true')
                            break
                        case "wiresFailing":
                            newState.wires.failing = (p[1] === 'true')
                            break
                        case "overrideBadWire":
                            newState.wires.override = (p[1] === 'true')
                            break
                          
                        case "light":
                            newState.light = (p[1] === 'true');
                            break
                        case "exampleDoor":
                            newState.exampleDoor = (p[1] === 'true')
                            break
                        case "key":
                            newState.key = (p[1] === 'true')
                            break
                        case "password":
                            newState.password = p[1]
                            break
                        case "overrideWinButton":
                            newState.overrideWinButton = (p[1] === 'true')
                            break
                        case "finished":
                            newState.finished = (p[1] === 'true')
                            break
                        case "solved":
                            newState.solved = (p[1] === 'true')
                            break    
                    }
                })

                // check if any interesting state toggled from last time
                if (newState.finished != this.state.finished) {
                    this.logger.log(this.logPrefix + 'bomb finished (' + newState.solved ? 'WON' : 'LOST' + ').')

                    this.EE.emit(EVENTS.BOMB_FINISHED);

                    // solved state tracks where it was a win or lose
                    if (newState.solved) {
                        this.audio.playTimed('shutdown.fromArduino.wav', 0);
                        this.audio.playTimed('success.3.wav', 5500);
                    } else {
                        // TODO: should probably just mix these down in audacity
                        this.audio.playTimed('bomb.fromArduino.wav', 0);
                        this.audio.playTimed('bomb.wav', 0);
                        this.audio.playTimed('bomb.fromArduino.wav', 2000);
                        this.audio.playTimed('bomb.wav', 1500);
                        this.audio.playTimed('bomb.fromArduino.wav', 4000);
                        this.audio.playTimed('bomb.wav', 3200);
                    }
                }

                if (newState.light && !this.state.light) {
                    this.logger.log(this.logPrefix + 'bomb opened.')
                    this.EE.emit(EVENTS.BOMB_OPENED);
                }

                // TODO: test and debug when both failures occur
                // Prioritize toggles audio first

                // play wire fail audio
                if (newState.wires.failing && !this.state.wires.failing) {
                    this.audio.play(['ahah.wav', 'siren.wav', 'warningRedWire.wav'], null, 0) 
                }

                // play toggle fail audio
                if (newState.toggles.failing && !this.state.toggles.failing) {
                    this.audio.play(['ahah.wav', 'siren.wav', 'incorrectToggles.wav'], null, 0)
                }

                // copy to our state now
                this.state = newState;

                ref.child('info/build').update({
                    version: newState.version,
                    date: newState.buildDate,
                    gitDate: newState.gitDate
                })

                ref.update({
                    time: newState.time,
                    toggles: newState.toggles,
                    wires: newState.wires,
                    light: newState.light,
                    exampleDoor: newState.exampleDoor,
                    key: newState.key,
                    password: newState.password,
                    overrideWinButton: newState.overrideWinButton,
                    finished: newState.finished,
                })                
            }
        },
        {
            pattern:/Warning: (\d+) minutes remaining./,
            match: (m) => {
                let minutes =  m[1]
                
                // NOTE: I intentionally kept this seperate from status updates since it seemed more consistent
                // at one point I coded infered from status but went back to this explicit way.
                this.logger.log(this.logPrefix + 'warning with ' + minutes + ' minute(s). playing warning.');
                switch(minutes) {
                    case "10":
                        this.audio.play('countdown_10min.wav')
                        break;
                        case "5":
                        this.audio.play('countdown_5min.wav')
                        break;
                        case "3":
                        this.audio.play('countdown_3min.wav')
                        break;
                        case "1":
                        this.audio.play('countdown_1min.wav')
                        break;
                }
            }
        });

        // start with unknown tnt state
        this.state = new TNTState();

        // now connect to serial
        this.connect()
    }

    // enable() {
    //     this.logger.log(this.logPrefix + 'sending enable command...')
    //     this.write('enable', err => {
    //         if (err) {
    //             this.logger.logger.error(this.logPrefix + 'Exception: ' + err)
    //         }
    //     });
    // }

    // disable() {
    //     this.logger.log(this.logPrefix + 'sending disable command...')
    //     this.write('disable', err => {
    //         if (err) {
    //             this.logger.logger.error(this.logPrefix + 'Exception: ' + err)
    //         }
    //     });
    // }
}


