let Manager = require('./manager.bluetooth')

module.exports = class PaintingManager extends Manager {
    constructor(opts) {
        let bt = new (require('./bluetooth'))({
            name: opts.name,
            address: '30:AE:A4:06:48:CA',
            channel: 1,
            logger: opts.logger
         });

        let ref = opts.fb.db.ref('landlord/devices/painting')

        let incoming = [];
        let handlers = {};

        super({ ...opts, bt: bt, handlers: handlers, incoming:incoming })

        // setup supported commands
        handlers['paint.getStatus'] = (s,cb) => {
            bt.write(`status\n`, (err) => {
                if (err) {
                    s.ref.update({ 'error': err });
                }
                cb()
            });
        }

        handlers['paint.setEnabled'] = (s,cb) => {
            let operation = s.val()
            let enabled = operation.data.enabled;
            let cmd = enabled ? 'enable' : 'disable'

            this.logger.log(`paint enabled: setting to '${enabled}'...`);

            bt.write(`${cmd}\n`, (err) => {
                if (err) {
                    s.ref.update({ 'error': err });
                }
    
                // this is a manual override to disable the device.  write to the database special that this was requested
                // so that any device state won't trigger a change to turn it back on.
                ref.once("value").then((snapshot) => {
                    this.logger.log('once callback for enabled');
                    let painting = snapshot.val()
    
                    // NOTE: only do this if the device is enabled, otherwise we could get into a state where the device can't be renabled.
                    if (painting.enabled) {
                        this.logger.log('was enabled so now setting state');
                        ref.update({ enabledOverride: !enabled })
                    }
                });
                cb()
            });
        }

        handlers['paint.setManual'] = (s,cb) => {
            let operation = s.val()
            let manual = operation.data.manual;

            this.logger.log(`paint manual: setting to '${manual}'...`);

            // write out over bluetooth
            bt.write(`manual ${manual}\n`, (err) => {
                if (err) {
                    s.ref.update({ 'error': err });
                }
                cb()
            });
        }

        handlers['paint.setThreshold'] = (s,cb) => {
            let operation = s.val()
            let threshold = operation.data.threshold;
    
            this.logger.log(`paint set threshold: sending set threshold to ${threshold}...`);
    
            bt.write('threshold ' + threshold + '\n', (err) => {
                if (err) {
                    s.ref.update({ 'error': err });
                }
    
                // NOTE: no need to update db here, it will come when the device does the operation and
                // outputs it
                cb()
            });
        }

        handlers['paint.setWait'] = (s,cb) => {
            let operation = s.val()
            let wait = operation.data.wait;

            this.logger.log(`paint set wait: sending set wait to ${wait}...`);

            bt.write('wait ' + wait + '\n', (err) => {
                if (err) {
                    s.ref.update({ 'error': err });
                }
                cb()
            });
        }

        handlers['paint.drop'] = (s,cb) => {
            this.logger.log(`paint drop: sending drop command...`);
            bt.write(`drop\n`, (err) => {
                if (err) {
                    s.ref.update({ 'error': err });
                }
                cb()
            });
        }
        
        
        // setup supported device output parsing
        incoming.push(
            {
                pattern:/threshold:\s+(\d+)/,
                match: (m) => {
                    ref.update({ threshold: m[1] })
                }
            },
            {
                pattern:/setting threshold to '(\d+)'.../,
                match: (m) => {
                    ref.update({ threshold: m[1] })
                }
            },
            {
                pattern:/wait:\s+(\d+)/,
                match: (m) => {
                    ref.update({ wait: m[1] })
                }
            },
            {
                pattern:/setting wait time to '(\d+)'.../,
                match: (m) => {
                    ref.update({ wait: m[1] })
                }
            },
            {
                pattern:/enabling device to drop now.../,
                match: (m) => {
                    ref.update({ enabled: true })
                }
            },
            {
                pattern:/turning manual override (.*)\.\.\./,
                match: (m) => {
                    let mm = undefined;
                    if (m[1] === "off") {
                        mm = 0;
                    } else if (m[1] === "on") {
                        mm = 1;
    
                    } else if (m[1] === "disabled") {
                        mm = 2;
                    }
                    ref.update({ manualMode: mm })
                }
            },
            {
                pattern:/disabling device now.../,
                match: (m) => {
                    ref.update({ enabled: false })
                }
            },
        );
        
        this.ref = ref
        this.serial = bt
        this.logger = opts.logger
    }
    
    activity() {
        // Don't update the last activity for now, as it causes weirdness with race conditions on site
        // this.ref.child('info').update({
        //   lastActivity: (new Date()).toLocaleString()
        //  })
    }

   connecting() {
       // NOTE: while connecting, mark device as disabled, since it defaults to that
       this.ref.child('info').update({
           isConnected: false
       })
   }

   connected() {
       this.ref.child('info').update({
           isConnected: true,
           // SEE ABOVE: lastActivity: (new Date()).toLocaleString()
       })
    }
}