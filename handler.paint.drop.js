
let OperationHandler = require('./handler')

module.exports = class PaintDropHandler extends OperationHandler {
    constructor(opts) {
        super('paint.drop', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        let operation = snapshot.val()

        this.logger.log(`paint drop: sending drop command...`);

        // write out over bluetooth
        this.bt.write(`drop\n`, (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.logger.log('paint drop: done.');

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}