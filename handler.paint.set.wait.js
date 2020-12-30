let OperationHandler = require('./handler')

module.exports = class PaintSetWaitHandler extends OperationHandler {
    constructor(opts) {
        super('paint.set.wait', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        let operation = snapshot.val()
        let wait = operation.data.wait;

        this.logger.log(`paint set wait: sending set wait to ${wait}...`);

        this.bt.write('wait ' + wait + '\n', (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.logger.log('paint set wait: done.');

            // NOTE: no need to update db here, it will come when the device does the operation and
            // outputs it

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}