let OperationHandler = require('./handler')

module.exports = class RefreshStateHandler extends OperationHandler {
    constructor(opts) {
        super('refreshState', opts)
        this.bt = opts.bt

        this.toggle1 = 0
        this.toggle2 = 0
        this.wire = 0
        this.keySolved = 0
        this.allSolved = 0
    }

    operate(snapshot, cb) {
        // set state to 'unknown' while we ask arduino
        this.logger.log('refresh state: clearing state from db before query.');
        this.state.updateState({
            toggle1: 1,
            toggle2: 1,
            wire: 1,
            keySolved: 1,
            allSolved: 1
        });

        // store operation objects so we can use when its all done
        this.snapshot = snapshot
        this.cb = cb

        // write out over bluetooth
        this.bt.write('status', (err) => {
            if (err) {
                snapshot.ref.update({ 'error': err });
            }
        });
    }

    response(data) {
        let finished = false
        let matched = false

        let patterns = [{
            pattern:/Status: /,
            match: (m) => {
                // NOOP line
            }
        },
        {
            pattern: /toggle1: (\d+)/,
            match: (m) => {
                this.toggle1 = m[1]
            }
        },
        {
            pattern: /toggle2: (\d+)/,
            match: (m) => {
                this.toggle2 = m[1]
            }
        },
        {
            pattern: /wire: (\d+)/,
            match: (m) => {
                this.wire = m[1]
            }
        },
        {
            pattern: /key solved: (\d+)/,
            match: (m) => {
                this.keySolved = m[1]
            }
        },
        {
            pattern: /all done: (\d+)/,
            match: (m) => {
                this.allSolved = m[1]
                finished = true
            }
        }]

        // loop over all response patterns and see if one matches this handler
        patterns.forEach(p => {
            let match = p.pattern.exec(data)
            if (match) {
                p.match(match)
                matched = true
            }
        })

        if(finished) {
            this.logger.log('refresh state: received toggle1: ' + this.toggle1 + 
            ' toggle2: ' + this.toggle2 +
            ' wire: ' + this.wire + 
            ' key solved: ' + this.keySolved + 
            ' all solved: ' + this.allSolved)

            this.state.updateState({
                toggle1: this.toggle1 === "0" ? 2 : 3,
                toggle2: this.toggle2 === "0" ? 2 : 3,
                wire: this.wire === "0" ? 2 : 3,
                keySolved: this.keySolved === "0" ? 1 : 2,
                allSolved: this.allSolved === "0" ? 1 : 2,
            });

            this.snapshot.ref.update({ 'completed': (new Date()).toString() });
            this.cb()
        }

        return matched
    }
}