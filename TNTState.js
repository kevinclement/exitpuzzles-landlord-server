module.exports = class TNTState {
    constructor() {
        this.version = "unknown"
        this.gitDate = "unknown"
        this.buildDate = "unknown"

        this.time = {
            hours:  0,
            minutes: 0,
            seconds: 0,
            timestamp: 0,
        }

        this.lockSolenoid = false;
        this.toggles = {
            toggle1: false,
            toggle2: false,
            toggle3: false,
            toggle4: false,
            toggle5: false,
            failing: false,
            override: false
        }

        this.wires = {
            wireD: 'U',
            wire2: 'C',
            wire3: 'U',
            wire4: 'U',
            failing: false,
            override: false
        }
        
        this.light = false;
        this.exampleDoor = false;
        this.key = false;
        this.keySolenoid = false;
        this.password = ''
        this.overrideWinButton = false;
        this.overrideDoorAjar = false;
        this.exitCode = true;
        this.finished = false;
        this.solved = false;
        this.timeLeftSolved = '';
        this.playSong = '';       
    }
}
