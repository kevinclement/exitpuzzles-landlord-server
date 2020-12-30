let OperationHandler = require('./handler')

module.exports = class AudioHandler extends OperationHandler {
    constructor(opts) {
        super('audio', opts)

        this.audio = opts.audio
    }

    operate(snapshot, cb) {
        let file = snapshot.val().file
        let fileName = file.file

        this.audio.play(fileName, (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            snapshot.ref.update({ 'completed': (new Date()).toString() })
            cb()
        })
    }
}