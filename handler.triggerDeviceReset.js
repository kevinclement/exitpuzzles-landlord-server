let OperationHandler = require('./handler')

module.exports = class TriggerDeviceResetHandler extends OperationHandler {
    constructor(opts) {
        super('triggerDeviceReset', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        this.logger.log('trigger device reset: triggering reset...');

        // write out over bluetooth
        this.bt.write('reset', (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            // clear out db state
            this.state.reset()

            this.logger.log('trigger device reset: done.');

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}