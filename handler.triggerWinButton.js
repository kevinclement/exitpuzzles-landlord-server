let OperationHandler = require('./handler')

module.exports = class TriggerWinButtonHandler extends OperationHandler {
    constructor(opts) {
        super('triggerWinButton', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        this.logger.log('trigger win button: toggling win button...');

        // write out over bluetooth
        this.bt.write('stopwin', (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.state.updateState({
                winButton: !this.state.winButton
            });

            this.logger.log('trigger win button: done.');

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}