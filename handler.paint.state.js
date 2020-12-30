let OperationHandler = require('./handler')

module.exports = class PaintStateHandler extends OperationHandler {
    constructor(opts) {
        super('NOOP_PSH', opts)

        this.paintingRef = opts.paintingRef
    }

    operate(snapshot, cb) {
        cb()
    }

    response(data) {

        let matched = false

        let patterns = [
        {
            pattern:/threshold:\s+(\d+)/,
            match: (m) => {
                this.paintingRef.update({ threshold: m[1] })
            }
        },
        {
            pattern:/setting threshold to '(\d+)'.../,
            match: (m) => {
                this.paintingRef.update({ threshold: m[1] })
            }
        },
        {
            pattern:/wait:\s+(\d+)/,
            match: (m) => {
                this.paintingRef.update({ wait: m[1] })
            }
        },
        {
            pattern:/setting wait time to '(\d+)'.../,
            match: (m) => {
                this.paintingRef.update({ wait: m[1] })
            }
        },
        {
            pattern:/enabling device to drop now.../,
            match: (m) => {
                this.paintingRef.update({ enabled: true })
            }
        },
        {
            pattern:/turning manual override (.*)\.\.\./,
            match: (m) => {
                let mm = undefined;
                if (m[1] === "off") {
                    mm = 0;
                } else if (m[1] === "on") {
                    mm = 1;

                } else if (m[1] === "disabled") {
                    mm = 2;
                }
                this.paintingRef.update({ manualMode: mm })
            }
        },
        {
            pattern:/disabling device now.../,
            match: (m) => {
                this.paintingRef.update({ enabled: false })
            }
        },
        ]

        patterns.forEach(p => {
            let match = p.pattern.exec(data)
            if (match) {
                p.match(match)
                matched = true
            }
        })

        return matched
    }
}