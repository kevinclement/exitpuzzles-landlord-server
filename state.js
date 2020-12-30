let dbUtil = require("./dbUtil");
const EventEmitter = require('events');
const STATE_EVENT = "state_changed";
const RESET_EVENT = "state_reset";

module.exports = class State {
    constructor(opts) {
        this.tntRef = opts.fb.db.ref('tnt')
        this.logger = opts.logger
        this.logPrefix = 'state: '
        this.EE = new EventEmitter();

        this.reset(true)
    }

    setAudio(audio) {
        this.audio = audio
    }

    reset(localOnly) {
        // NOTE: if the defaults ever change on the device, they would need to be updated here

        // default state
        this.toggle1 = 2
        this.toggle2 = 2
        this.wire = 2 
        this.allSolved = 1
        this.keySolved = 1
        this.lastBadPassword = 'xxxxxxxxxxxxxxx'
        this.lightDetected = false
        this.timeLeftSolved = ''
        this.switchErrors = false
        this.wireErrors = false
        this.winButton = false

        // default time
        this.hours = 1
        this.minutes = 8
        this.seconds = 1
        this.timestamp = (new Date()).getTime()

        // update db
        if (!localOnly) {
            this.EE.emit(RESET_EVENT);

            this.updateState(this)
            this.updateTime(this)
        }
    }

    updateState(newState) {
        // copy into local object
        Object.assign(this, newState)

        // update the db
        dbUtil.updateState(this)

        // signal to anyone listening that state changed
        this.EE.emit(STATE_EVENT);
    }

    stateChanged(cb) {
        this.EE.on(STATE_EVENT, cb);
    }

    stateReset(cb) {
        this.EE.on(RESET_EVENT, cb);
    }

    warningTime(timeLeft) {
        this.logger.log(this.logPrefix + 'warning with ' + timeLeft + ' minute(s). playing warning.');

        switch(timeLeft) {
            case "10":
              this.audio.play('countdown_10min.wav')
              break;
            case "5":
              this.audio.play('countdown_5min.wav')
              break;
            case "3":
              this.audio.play('countdown_3min.wav')
              break;
            case "1":
              this.audio.play('countdown_1min.wav')
              break;
        }
    }

    updateTime(newTime) {
        // copy into local object
        Object.assign(this, newTime)

        // update the db
        dbUtil.updateTime(this)
    }
}