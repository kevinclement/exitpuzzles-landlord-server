let OperationHandler = require('./handler')

module.exports = class SwitchErrorsHandler extends OperationHandler {
    constructor(opts) {
        super('switchErrors', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        this.logger.log('switch errors: turning off switch errors...');

        // write out over bluetooth
        this.bt.write('stop', (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.state.updateState({
                switchErrors: true
            });

            this.logger.log('switch errors: done.');

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}