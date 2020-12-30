let OperationHandler = require('./handler')

module.exports = class PaintSetThresholdHandler extends OperationHandler {
    constructor(opts) {
        super('paint.set.threshold', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        let operation = snapshot.val()
        let threshold = operation.data.threshold;

        this.logger.log(`paint set threshold: sending set threshold to ${threshold}...`);

        this.bt.write('threshold ' + threshold + '\n', (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.logger.log('paint set threshold: done.');

            // NOTE: no need to update db here, it will come when the device does the operation and
            // outputs it

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}