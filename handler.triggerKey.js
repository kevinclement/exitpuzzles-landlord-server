let OperationHandler = require('./handler')

module.exports = class TriggerKeyHandler extends OperationHandler {
    constructor(opts) {
        super('triggerKey', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        this.logger.log('trigger key: triggering key...');

        // write out over bluetooth
        this.bt.write('key', (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.logger.log('trigger key: done.');

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}