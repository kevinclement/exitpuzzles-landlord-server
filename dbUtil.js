module.exports = {
    updateState: function(state) {
      state.tntRef.child('state').update({
        toggle1: state.toggle1,
        toggle2: state.toggle2,
        wire: state.wire,
        allSolved: state.allSolved,
        keySolved: state.keySolved,
        lastBadPassword: state.lastBadPassword,
        lightDetected: state.lightDetected,
        timeLeftSolved: state.timeLeftSolved,
        switchErrors: state.switchErrors,
        wireErrors: state.wireErrors,
        winButton: state.winButton
      })
    },

    updateTime: function(state) {
      state.tntRef.child('time').update({
        hours: state.hours,
        minutes: state.minutes,
        seconds: state.seconds,
        timestamp: state.timestamp
      })
    }
};