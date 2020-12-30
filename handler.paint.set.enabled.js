let OperationHandler = require('./handler')

module.exports = class PaintEnabledHandler extends OperationHandler {
    constructor(opts) {
        super('paint.set.enabled', opts)
        this.bt = opts.bt
        this.paintingRef = opts.paintingRef
    }

    operate(snapshot, cb) {
        let operation = snapshot.val()
        let enabled = operation.data.enabled;
        let cmd = enabled ? 'enable' : 'disable'

        this.logger.log(`paint enabled: setting to '${enabled}'...`);

        this.bt.write(`${cmd}\n`, (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }

            // this is a manual override to disable the device.  write to the database special that this was requested
            // so that any device state won't trigger a change to turn it back on.
            this.paintingRef.once("value").then((snapshot) => {
                this.logger.log('once callback for enabled');
                let painting = snapshot.val()

                // NOTE: only do this is the device is enabled, otherwise we could get into a state where the device can't be renabled.
                if (painting.enabled) {
                    this.logger.log('was enabled so now setting state');
                    this.paintingRef.update({ enabledOverride: !enabled })
                }
            });

            this.logger.log('paint enabled: done.');

            snapshot.ref.update({ 'completed': (new Date()).toString() });
            cb()
        });
    }
}