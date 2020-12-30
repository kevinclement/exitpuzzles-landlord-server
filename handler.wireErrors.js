let OperationHandler = require('./handler')

module.exports = class WireErrorsHandler extends OperationHandler {
    constructor(opts) {
        super('wireErrors', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        this.logger.log('wire errors: turning off wire errors...');

        // write out over bluetooth
        this.bt.write('stopwire', (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.state.updateState({
                wireErrors: true
            });

            this.logger.log('wire errors: done.');

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}