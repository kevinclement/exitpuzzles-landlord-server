let OperationHandler = require('./handler')

module.exports = class TriggerWinHandler extends OperationHandler {
    constructor(opts) {
        super('triggerWin', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        this.logger.log('trigger win: triggering win...');

        // write out over bluetooth
        this.bt.write('win', (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.logger.log('trigger win: done.');

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}