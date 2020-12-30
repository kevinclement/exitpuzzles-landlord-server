let Manager = require('./manager')

module.exports = class TntManager extends Manager {
    constructor(opts) {
        let bt = new (require('./bluetooth'))({ 
            name: opts.name,
            address: '20:16:03:10:17:88',
            channel: 1,
            logger: opts.logger
         });

        // all tnt based operation handlers
        let handlerOpts = { ...opts, bt: bt }
        let handlers = [
            new (require('./handler.parseUpdates'))(handlerOpts),
            new (require('./handler.refreshState'))(handlerOpts),
            new (require('./handler.refreshTime'))(handlerOpts),
            new (require('./handler.setTime'))(handlerOpts),
            new (require('./handler.switchErrors'))(handlerOpts),
            new (require('./handler.triggerDeviceReset'))(handlerOpts),
            new (require('./handler.triggerKey'))(handlerOpts),
            new (require('./handler.triggerWire'))(handlerOpts),
            new (require('./handler.triggerBlink'))(handlerOpts),
            new (require('./handler.triggerBlinkWithCode'))(handlerOpts),
            new (require('./handler.triggerWin'))(handlerOpts),
            new (require('./handler.triggerWinButton'))(handlerOpts),
            new (require('./handler.wireErrors'))(handlerOpts),
            new (require('./handler.fake'))(handlerOpts)
        ];

        super({ ...opts, bt: bt, handlers: handlers })

        this.tntRef = opts.fb.db.ref('tnt')
        this.logger = opts.logger
    }

    activity() {
        // update last operation in db so we can show in UI
        this.tntRef.update({
            lastActivity: (new Date()).toLocaleString()
        })
    }

    connecting() {
        this.tntRef.update({
            isConnected: false
        })
    }

    connected() {
        this.tntRef.update({
            isConnected: true
        })
    }
}