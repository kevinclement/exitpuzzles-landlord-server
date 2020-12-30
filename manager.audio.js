let Manager = require('./manager')

module.exports = class AudioManager extends Manager {
    constructor(opts) {

        let handlers = [
            new (require('./handler.audio'))(opts),
        ];

        super({ ...opts, handlers: handlers })
    }

    activity() {
        // NOOP for now
    }

}