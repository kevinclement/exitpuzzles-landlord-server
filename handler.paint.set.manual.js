let OperationHandler = require('./handler')

module.exports = class PaintManualHandler extends OperationHandler {
    constructor(opts) {
        super('paint.set.manual', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        let operation = snapshot.val()
        let manual = operation.data.manual;

        this.logger.log(`paint manual: setting to '${manual}'...`);

        // write out over bluetooth
        this.bt.write(`manual ${manual}\n`, (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.logger.log('paint manual: done.');

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}