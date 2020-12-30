let fb = new (require('./firebase'))
let ng = require('./ngrok')
let logger = new (require('./logging'))
let state = new (require('./state'))({ logger: logger, fb: fb })
let audio = new (require('./audio'))({ logger: logger, state: state })
let tnt = new (require('./manager.tnt'))({ name: 'tnt', logger: logger, fb: fb, state: state, audio: audio })
let morse = new (require('./manager.morse'))({ name: 'morse', logger: logger, fb: fb, state: state })
let painting = new (require('./manager.painting'))({ name: 'painting', logger: logger, fb: fb, state: state })
let audioManager = new (require('./manager.audio'))({ name: 'audio', logger: logger, fb: fb, state: state, audio: audio })

// set audio, can't inject because of circular dep
state.setAudio(audio)

// might want to turn this off while doing dev, so I have a flag for it
let ENABLE_FIREBASE_LOGS = true;
if (ENABLE_FIREBASE_LOGS) {
    logger.enableFirebase(fb.db);
}

logger.log('pi: Started ExitPuzzles server.');

// listen for control operations in the db, filter only ops not completed
fb.db.ref('operations').orderByChild('completed').equalTo(null).on("child_added", function(snapshot) {
    logger.log('pi: received op ' + snapshot.val().command);

    // send to tnt device
    tnt.handle(snapshot);

    // send to morse device
    morse.handle(snapshot);

    // send to painting device
    painting.handle(snapshot);

    // send to the audio handler
    audioManager.handle(snapshot);
 });

// get local ngrok port so I can automate that on my machine
logger.log('pi: Getting local ngrok port...');
ng.getLocalPort((port) => {
    if (!port) return

    logger.log('pi: found ngrok port ' + port);

    // update port in db
    fb.db.ref('status').update({
        ngrok: port
    });
})

// update started time and set a ping timer
fb.db.ref('status').update({
    piStarted: (new Date()).toLocaleString(),
    piPing: (new Date()).getTime()
})

// heartbeat timer
setInterval(()  => {
    fb.db.ref('status').update({
        piPing: (new Date()).getTime()
    })
}, 30000)