let OperationHandler = require('./handler')

module.exports = class FakeHandler extends OperationHandler {
    constructor(opts) {
        super('fake', opts)
        this.bt = opts.bt
    }

    operate(snapshot, cb) {

        let op = snapshot.val().op.replace("\n", "")
        this.bt.write('fake ' + op);
        snapshot.ref.update({ 'completed': (new Date()).toString() });
        cb()
    }
}