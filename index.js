const EventEmitter = require('events');
const EVENTS = require('./events');
let EE = new EventEmitter();

let fb = new (require('./firebase'))
let logger = new (require('./logging'))

let state = new (require('./state'))({ logger: logger, fb: fb })
let audio = new (require('./audio'))({ logger: logger, state: state })

let compass = new (require('./manager.compass'))({ name: 'compass', logger: logger, fb: fb, EE:EE });
let tnt = new (require('./manager.tnt-serial'))({ name: 'tnt', logger: logger, fb: fb, EE:EE, audio:audio  });
let managers = [];
managers.push(compass);
managers.push(tnt);

// TODO: add back
// let tnt = new (require('./manager.tnt'))({ name: 'tnt', logger: logger, fb: fb, state: state, audio: audio })
// let morse = new (require('./manager.morse'))({ name: 'morse', logger: logger, fb: fb, state: state })
// let painting = new (require('./manager.painting'))({ name: 'painting', logger: logger, fb: fb, state: state })
// let audioManager = new (require('./manager.audio'))({ name: 'audio', logger: logger, fb: fb, state: state, audio: audio })

// set audio, can't inject because of circular dep
state.setAudio(audio)

// might want to turn this off while doing dev, so I have a flag for it
let ENABLE_FIREBASE_LOGS = true;
if (ENABLE_FIREBASE_LOGS) {
    logger.enableFirebase(fb.db);
}

logger.log('pi: Started ExitPuzzles Landlord server.');

// track firebase connect and disconnects and log them so we can see how often it happens
let _connecting = true;
fb.db.ref('.info/connected').on('value', function(connectedSnap) {
  if (connectedSnap.val() === true) {
    logger.log('pi: firebase connected.');
  } else {
    // dont print an error while its still connecting on first start
    if (_connecting) {
      _connecting = false;
    } else {
      logger.log('pi: firebase dropped connection!');
    }
  }
});

// listen for control operations in the db, filter only ops not completed
fb.db.ref('landlord/operations').orderByChild('completed').equalTo(null).on("child_added", function(snapshot) {
    logger.log('pi: received op ' + snapshot.val().command);

    managers.forEach((m) => {
        m.handle(snapshot);
    });

    // TODO: REMOVE once all other managers are updated
    // // send to tnt device
    // tnt.handle(snapshot);

    // // send to morse device
    // morse.handle(snapshot);

    // // send to painting device
    // painting.handle(snapshot);

    // // send to the audio handler
    // audioManager.handle(snapshot);

 });

// update started time and set a ping timer
fb.db.ref('landlord/status').update({
    piStarted: (new Date()).toLocaleString(),
    piPing: (new Date()).getTime()
})

// heartbeat timer
setInterval(()  => {
    fb.db.ref('landlord/status').update({
        piPing: (new Date()).getTime()
    })
}, 30000)