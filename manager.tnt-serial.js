let Manager = require('./manager.serial')
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
                m[1].split(',').forEach((s)=> {
                    let p = s.split(/:(.+)/);
                    switch(p[0]) {
                        case "version": 
                            this.version = p[1]
                            break
                        case "gitDate": 
                            this.gitDate = p[1]
                            break 
                        case "buildDate": 
                            this.buildDate = p[1]
                            break
                            
                        case "time":
                            let tm = /(\d+):(\d+):(\d+)/.exec(p[1]);
                            if (tm) {
                                this.time.hours = parseInt(tm[1])
                                this.time.minutes = parseInt(tm[2])
                                this.time.seconds = parseInt(tm[3])

                                // TODO: verify we still need this
                                //this.timestamp = (new Date()).getTime()
                            }
                            break

                        case "toggle1":
                            this.toggles.toggle1 = (p[1] === 'true')
                            break
                        case "toggle2":
                            this.toggles.toggle2 = (p[1] === 'true')
                            break
                        case "toggle3":
                            this.toggles.toggle3 = (p[1] === 'true')
                            break
                        case "toggle4":
                            this.toggles.toggle4 = (p[1] === 'true')
                            break
                        case "toggle5":
                            this.toggles.toggle5 = (p[1] === 'true')
                            break
                        case "togglesFailing":
                            this.toggles.failing = (p[1] === 'true')
                            break
                        case "overrideToggles":
                            this.toggles.override = (p[1] === 'true')
                            break
                        
                        case "wire1":
                            this.wires.wire1 = (p[1] === 'true')
                            break
                        case "wire2":
                            this.wires.wire2 = (p[1] === 'true')
                            break
                        case "wire3":
                            this.wires.wire3 = (p[1] === 'true')
                            break
                        case "wire4":
                            this.wires.wire4 = (p[1] === 'true')
                            break
                        case "wiresFailing":
                            this.wires.failing = (p[1] === 'true')
                            break
                        case "overrideBadWire":
                            this.wires.override = (p[1] === 'true')
                            break
                          
                        case "light":
                            let hasLight = (p[1] === 'true')
                            if (!this.light && hasLight) {
                                this.EE.emit(EVENTS.BOMB_OPENED);
                            }
                            this.light = hasLight;
                            
                            break
                        case "exampleDoor":
                            this.exampleDoor = (p[1] === 'true')
                            break
                        case "key":
                            this.key = (p[1] === 'true')
                            break
                        case "password":
                            this.password = p[1]
                            break
                        case "overrideWinButton":
                            this.overrideWinButton = (p[1] === 'true')
                            break
                        case "solved":
                            this.solved = (p[1] === 'true')
                            break
                    }
                })

                ref.child('info/build').update({
                    version: this.version,
                    date: this.buildDate,
                    gitDate: this.gitDate
                })

                // TODO: should we split into better subsections?  e.g. toggles\
                ref.update({
                    time: this.time,
                    toggles: this.toggles,
                    wires: this.wires,
                    light: this.light,
                    exampleDoor: this.exampleDoor,
                    key: this.key,
                    password: this.password,
                    overrideWinButton: this.overrideWinButton,
                    solved: this.solved,
                })
            }
        });

        this.version = "unknown"
        this.gitDate = "unknown"
        this.buildDate = "unknown"

        this.time = {
            hours:  0,
            minutes: 0,
            seconds: 0
        }

        this.toggles = {
            toggle1: false,
            toggle2: false,
            toggle3: false,
            toggle4: false,
            toggle5: false,
            failing: false,
            override: false
        }

        this.wires = {
            wire1: false,
            wire2: false,
            wire3: false,
            wire4: false,
            failing: false,
            override: false
        }
        
        this.light = false;
        this.exampleDoor = false;
        this.key = false;
        this.password = ''
        this.overrideWinButton = false;
        this.solved = false;

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
