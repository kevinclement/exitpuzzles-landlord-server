let OperationHandler = require('./handler')

module.exports = class TriggerWireHandler extends OperationHandler {
    constructor(opts) {
        super('triggerWire', opts)
        this.bt = opts.bt
        this.audio = opts.audio
    }

    operate(snapshot, cb) {
        this.logger.log('trigger wire: triggering wire error...');

        // write out over bluetooth
        this.bt.write('wires', (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.logger.log('trigger wire: done.');

            // TODO: move audio files to a common ref location

            // now play warning audio
            this.audio.play("siren.wav", (err) => {
                
                // and then play audio for 'incorrect wires speeds up device'
                this.audio.play("incorrectWires.wav", (err) => {
                })
            })

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}