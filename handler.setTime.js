let OperationHandler = require('./handler')

module.exports = class SetTimeHandler extends OperationHandler {
    constructor(opts) {
        super('setTime', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {
        let operation = snapshot.val()
        let hours = operation.data.hours;
        let minutes = operation.data.minutes;
        let seconds = operation.data.seconds;

        this.logger.log('set time: setting time to ' + hours + ':' + minutes + ':' + seconds + ' ...');

        // write out over bluetooth
        this.bt.write('set ' + hours + ':' + minutes + ':' + seconds, (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            this.logger.log('set time: done.');

            // update database with new time
            this.state.updateTime({
                hours: parseInt(hours),
                minutes: parseInt(minutes),
                seconds: parseInt(seconds),
                timestamp: (new Date()).getTime()
            });

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}