let Manager = require('./manager')

module.exports = class MorseManager extends Manager {
    constructor(opts) {
        let bt = new (require('./bluetooth'))({
            name: opts.name,
            address: '00:12:10:26:19:32',
            channel: 1,
            logger: opts.logger
         });

        let handlers = [
            new (require('./handler.clue'))({ ...opts, bt: bt }),
        ];

        super({ ...opts, bt: bt, handlers: handlers })

        this.morseRef = opts.fb.db.ref('morse')
    }

    activity() {
        // update last operation in db so we can show in UI
        this.morseRef.update({
            lastActivity: (new Date()).toLocaleString()
        })
    }

    connecting() {
        this.morseRef.update({
            isConnected: false
        })
    }

    connected() {
        this.morseRef.update({
            isConnected: true
        })
    }
}