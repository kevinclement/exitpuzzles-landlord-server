
let OperationHandler = require('./handler')

module.exports = class PaintGetStatusHandler extends OperationHandler {
    constructor(opts) {
        super('paint.get.status', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        let operation = snapshot.val()

        this.logger.log(`paint status: sending status command...`);

        // write out over bluetooth
        this.bt.write(`status\n`, (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.logger.log('paint status: done.');

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}