let OperationHandler = require('./handler')

module.exports = class RefreshTimeHandler extends OperationHandler {
    constructor(opts) {
        super('refreshTime', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {

        // store operation objects so we can use when its all done
        this.snapshot = snapshot
        this.cb = cb

        // write out over bluetooth
        this.bt.write('time', (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }
        });
    }

    response(data) {

        var pattern = /current time: (\d+):(\d+):(\d+)/;
        let match = pattern.exec(data);

        if (!match) return false

        let hours   = parseInt(match[1])
        let minutes = parseInt(match[2])
        let seconds = parseInt(match[3])

        this.logger.log('refresh time: received ' + hours + ':' + minutes + ':' + seconds);

        this.state.updateTime({
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            timestamp: (new Date()).getTime()
        });

        if (this.snapshot && this.snapshot.ref) {
            this.snapshot.ref.update({ 'completed': (new Date()).toString() });    
        }

        if (this.cb) {
            this.cb()
        }

        // reset local pointer to previous calls
        this.snapshot = null;
        this.cb = null;

        return true
    }
}