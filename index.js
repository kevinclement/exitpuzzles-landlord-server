const EventEmitter = require('events');
const EVENTS = require('./events');
let EE = new EventEmitter();

let fb = new (require('./firebase'))
let logger = new (require('./logging'))
let audio = new (require('./audio'))({ logger: logger, EE: EE })

let managers = [];
managers.push(new (require('./manager.compass'))({ name: 'compass', logger: logger, fb: fb, EE:EE }));
managers.push(new (require('./manager.tnt'))({ name: 'tnt', logger: logger, fb: fb, EE:EE, audio:audio  }));
managers.push(new (require('./manager.morse-bt'))({ name: 'morse', logger: logger, fb: fb }))
managers.push(new (require('./manager.painting-bt'))({ name: 'painting', logger: logger, fb: fb, EE: EE }))

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