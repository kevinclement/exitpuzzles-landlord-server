let OperationHandler = require('./handler')

module.exports = class TriggerBlinkHandler extends OperationHandler {
    constructor(opts) {
        super('triggerBlink', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        this.logger.log('trigger blink: triggering blink...');

        // write out over bluetooth
        this.bt.write('blink', (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.logger.log('trigger blink: done.');

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}