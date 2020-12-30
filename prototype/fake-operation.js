var firebase = require("firebase");

let config = {
    apiKey: "AIzaSyBq1tyRDtpAkMFwi3ZIkS24cBBG3r0EUqU",
    authDomain: "exitpuzzles-admin.firebaseapp.com",
    databaseURL: "https://exitpuzzles-admin.firebaseio.com",
    projectId: "exitpuzzles-admin",
    storageBucket: "exitpuzzles-admin.appspot.com",
    messagingSenderId: "927373652924"
}

// Initialize Firebase
let db = firebase.initializeApp(config).database()

// i => fakeIncorrectCode();
// w => fakeWiresSolved();
// t => fakeTrunkOpen();
// e => fakeEndOfGameWinner();
// l => fakeEndOfGameLose();
// p => fakePenalty();

//db.ref('operations').push({command: "fake", op: "i"})

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
    db.ref('operations').push({command: "fake", op: chunk})
});
