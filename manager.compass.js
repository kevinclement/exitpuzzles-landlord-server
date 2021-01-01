let Manager = require('./manager.serial')
const EVENTS = require('./events');

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

        this.EE = opts.EE;

        // hookup any global listeners 
        this.EE.on(EVENTS.BOMB_OPENED, () => {
            this.enable();
        });
        
        this.EE.on(EVENTS.BOMB_FINISHED, () => {
            this.disable();
        });

        // setup supported commands
        handlers['compass.reset'] = (s,cb) => {
          this.write('reboot', err => {
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

    enable() {
        this.logger.log(this.logPrefix + 'sending enable command...')
        this.write('enable', err => {
            if (err) {
                this.logger.logger.error(this.logPrefix + 'Exception: ' + err)
            }
        });
    }

    disable() {
        this.logger.log(this.logPrefix + 'sending disable command...')
        this.write('disable', err => {
            if (err) {
                this.logger.logger.error(this.logPrefix + 'Exception: ' + err)
            }
        });
    }
}
