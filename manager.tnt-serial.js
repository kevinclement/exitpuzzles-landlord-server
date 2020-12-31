let Manager = require('./manager.serial')

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
                                this.hours   = parseInt(tm[1])
                                this.minutes = parseInt(tm[2])
                                this.seconds = parseInt(tm[3])

                                // TODO: verify we still need this
                                //this.timestamp = (new Date()).getTime()
                            }
                            break

                        case "toggle1":
                            this.toggle1 = (p[1] === 'true')
                            break
                        case "toggle2":
                            this.toggle2 = (p[1] === 'true')
                            break
                        case "toggle3":
                            this.toggle3 = (p[1] === 'true')
                            break
                        case "toggle4":
                            this.toggle4 = (p[1] === 'true')
                            break
                        case "toggle5":
                            this.toggle5 = (p[1] === 'true')
                            break
                        case "togglesFailing":
                            this.togglesFailing = (p[1] === 'true')
                            break
                        case "overrideToggles":
                            this.overrideToggles = (p[1] === 'true')
                            break
                        
                        case "wire1":
                            this.wire1 = (p[1] === 'true')
                            break
                        case "wire2":
                            this.wire2 = (p[1] === 'true')
                            break
                        case "wire3":
                            this.wire3 = (p[1] === 'true')
                            break
                        case "wire4":
                            this.wire4 = (p[1] === 'true')
                            break
                        case "wiresFailing":
                            this.wiresFailing = (p[1] === 'true')
                            break
                        case "overrideBadWire":
                            this.overrideBadWire = (p[1] === 'true')
                            break
                          
                        case "light":
                            this.light = (p[1] === 'true')
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
                    time: 
                    {
                        hours: this.hours,
                        minutes: this.minutes,
                        seconds: this.seconds
                    },
                    toggle1: this.toggle1,
                    toggle2: this.toggle2,
                    toggle3: this.toggle3,
                    toggle4: this.toggle4,
                    toggle5: this.toggle5,
                    togglesFailing: this.togglesFailing,
                    overrideToggles: this.overrideToggles,

                    wire1: this.wire1,
                    wire2: this.wire2,
                    wire3: this.wire3,
                    wire4: this.wire4,
                    wiresFailing: this.wiresFailing,
                    overrideBadWire: this.overrideBadWire,

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

        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        
        this.toggle1 = false;
        this.toggle2 = false;
        this.toggle3 = false;
        this.toggle4 = false;
        this.toggle5 = false;
        this.togglesFailing = false;
        this.overrideToggles = false;

        this.wire1 = false;
        this.wire2 = false;
        this.wire3 = false;
        this.wire4 = false;
        this.wiresFailing = false;
        this.overrideBadWire = false;

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
