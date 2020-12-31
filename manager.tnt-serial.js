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
            baudRate: 9600,
            handlers: handlers,
            incoming:incoming,
        })

        this.EE = opts.EE;

        // setup supported commands
        // handlers['compass.foo'] = (s,cb) => {
        //   this.foo = true
        //   this.write('someCommand', err => {
        //     if (err) {
        //       s.ref.update({ 'error': err });
        //     }
        //     cb()
        //   });
        // }

        // setup supported device output parsing
        incoming.push(
        {
            pattern:/.*status=(.*)/,
            match: (m) => {
                // variables that track state changes across all options
                // this is needed so I don't rely on ordering while parsing
                // I think to do this properly this split foreach would result in a status
                // object when its done.  then I take that object and update "this" and the database
                // It would allow me to compare "this" to the parsed object fully and not rely on order
                
                // TODO: maybe a TNTState class
                // TODO: when I switch to this parsedStatus, change hasLight and hasFinished
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

                                // TODO: verify we still need this
                                //state.timestamp = (new Date()).getTime()
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
                            // TODO: AUDIO
                            // Note: need to take into account override so prob can't just call here
                            // I could change ordering in the status but that seems fragile
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
                            // TODO: AUDIO
                            // Note: need to take into account override so prob can't just call here
                            newState.wires.failing = (p[1] === 'true')
                            break
                        case "overrideBadWire":
                            newState.wires.override = (p[1] === 'true')
                            break
                          
                        case "light":
                            let hasLight = (p[1] === 'true')
                            if (!this.state.light && hasLight) {
                                this.logger.log(this.logPrefix + 'bomb opened.')
                                this.EE.emit(EVENTS.BOMB_OPENED);
                            }
                            newState.light = hasLight;
                            
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
                            let hasFinished = (p[1] === 'true')
                            if (!this.state.finished && hasFinished) {
                                this.logger.log(this.logPrefix + 'bomb finished.')
                                this.EE.emit(EVENTS.BOMB_FINISHED);
                            }
                            newState.finished = hasFinished
                            break
                    }
                })

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


