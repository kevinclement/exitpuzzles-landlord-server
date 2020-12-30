let OperationHandler = require('./handler')

module.exports = class TriggerBlinkWithCodeHandler extends OperationHandler {
    constructor(opts) {
        super('triggerBlinkWithCode', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        this.logger.log('trigger blink code: triggering blink...');

        // write out over bluetooth
        this.bt.write('blink', (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.logger.log('trigger blink code: playing audio.');
            
            this.audio.play("bomb_disabled.wav");

            this.logger.log('trigger blink code: done.');

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}