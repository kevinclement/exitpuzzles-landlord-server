module.exports = class OperationHandler {
    constructor(cmd, opts) {
        this.cmd = cmd
        this.logger = opts.logger
        this.state = opts.state
        this.audio = opts.audio
    }

    canHandle(snapshot) {
        return this.cmd === snapshot.val().command
    }

    handle(snapshot, cb) {
        // mark it received since all handlers would need to do it
        snapshot.ref.update({ 'received': (new Date()).toString() });

        // call into subclass command to do operation
        this.operate(snapshot, cb)
    }
}