let Manager = require('./manager.serial')

module.exports = class CompassManager extends Manager {
    constructor(opts) {
        let incoming = [];
        let handlers = {};

        let ref = opts.fb.db.ref('landlord/devices/compass')

        super({ 
            ...opts,
            ref: ref,
            dev:'/dev/ttyCOMPASS',
            baudRate: 9600,
            handlers: handlers,
            incoming:incoming,
        })

        // setup supported commands
        handlers['compass.foo'] = (s,cb) => {
            // this.forced = true
            // this.write('increment', err => {
            //     if (err) {
            //         s.ref.update({ 'error': err });
            //     }
            //     cb()
            // });
        }

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
                        
                        case "enabled": 
                            this.enabled = (p[1] === 'true')
                            break

                        case "red":
                            this.red = (p[1] === 'true')
                            break
                        case "green": 
                            this.green = (p[1] === 'true')
                            break
                        case "blue": 
                            this.blue = (p[1] === 'true')
                            break
                        case "yellow": 
                            this.yellow = (p[1] === 'true')
                            break   
                    }
                })

                ref.child('info/build').update({
                    version: this.version,
                    date: this.buildDate,
                    gitDate: this.gitDate
                })

                ref.update({
                    enabled: this.enabled,
                    red: this.red,
                    green: this.green,
                    blue: this.blue,
                    yellow: this.yellow
                })
            }
        });

        // this.audio = opts.audio

        // this.solved = false
        this.version = "unknown"
        this.gitDate = "unknown"
        this.buildDate = "unknown"
        
        this.red = false
        this.green = false
        this.blue = false
        this.yellow = false

        this.enabled = false

        // now connect to serial
        this.connect()
    }

    // coinChange() {
    //     this.logger.log(this.logPrefix + 'detected coin change...')
    //     var _solved = this.solved
    //     this.play("coin.wav", () => {
    //         if (_solved) {
    //             this.allCoins()
    //         }
    //     })
    // }

    // play(fName, cb) {
    //     this.audio.play(fName, (err) => {
    //         if (cb) {
    //             cb()
    //         }
    //     })
    // }
}
