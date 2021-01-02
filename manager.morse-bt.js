let Manager = require('./manager.bluetooth')

module.exports = class MorseManager extends Manager {
    constructor(opts) {
        let bt = new (require('./bluetooth'))({
            name: opts.name,
            address: '00:12:10:26:19:32',
            channel: 1,
            logger: opts.logger
         });

        let ref = opts.fb.db.ref('landlord/devices/morse')

        let incoming = [];
        let handlers = {};

        super({ ...opts, bt: bt, handlers: handlers, incoming:incoming })

        // setup supported commands
        handlers['morse.clue'] = (s,cb) => {
            let clue = s.val().clue
            let cluestr = ''

            // if errorType, that means we need to send it as feedback
            // the arduino is setup so that if you send @ in front of string it interprets it as feedback/error
            if (clue.errorType) {
                cluestr += '@'
            }
            cluestr += clue.line1

            if (clue.line2 !== '') {
                cluestr += '#' + clue.line2
            }

            this.logger.log('clue: sending \'' + cluestr + '\'...')
            bt.write(cluestr + '\n', (err) => {
                if (err) {
                    s.ref.update({ 'error': err });
                }

                this.logger.log('clue: sent.');
                cb()
            });
        }
        

        this.ref = ref
        this.serial = bt
        this.logger = opts.logger
    }
    
    activity() {
        // Don't update the last activity for now, as it causes weirdness with race conditions on site
        //     this.ref.child('info').update({
        //         lastActivity: (new Date()).toLocaleString()
        //    })
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