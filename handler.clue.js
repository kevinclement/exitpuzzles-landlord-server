let OperationHandler = require('./handler')

module.exports = class ClueHandler extends OperationHandler {
    constructor(opts) {
        super('clue', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        let clue = snapshot.val().clue
        let cluestr = ''

        // if errorType, that means we need to send it as feedback
        // the arduino is setup so that if you send @ in front of string it interprets it as feedback/error
        if (clue.errorType) {
            cluestr += '@'
        }
        cluestr += clue.line1

        if (clue.line2 !== '') {
            cluestr += '#' + clue.line2
        }

        this.logger.log('clue: sending \'' + cluestr + '\'...')

        this.bt.write(cluestr + '\n', (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.logger.log('clue: sent.');

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}