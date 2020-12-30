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

// TMP sequenced table for testing
// ------------------------------------------
// clear tmp table
// db.ref('tmplogs').set({});

// // create tmp tables sequenced
// for (var i=1; i <= 10; i++) {
//     console.log('creating for ' + i);

//     db.ref().child('tmplogs').push({
//         data: i
//    });
// }
// ------------------------------------------

let limit = 2 + 1;

let refreshing = true;
let firstKey = null;
let lastKey = null;
let lastValue = null;
db.ref('tmplogs').orderByKey().limitToFirst(limit).on("child_added", function(snapshot) {
    console.log("" + snapshot.key + " : " + snapshot.val().data);

    if (refreshing) {
        refreshing = false;
        firstKey = snapshot.key;
    }

    lastKey = snapshot.key;
    lastValue = snapshot.val().data;
});

setTimeout(function() {
    console.log();
    console.log('fk: ' + firstKey + ' lk: ' + lastKey + " : " + lastValue)
    console.log();

    // simulate next
    db.ref('tmplogs').orderByKey().startAt(lastKey).limitToFirst(limit).on("child_added", function(snapshot) {
        console.log("next" + snapshot.key + " : " + snapshot.val().data);
    });

}, 1000);

// let queryTmp = db.ref('logs').limitToLast(5).on("child_added", function(snapshot) {
//    console.log("tmp: " + snapshot.key + " : " + snapshot.val().timestamp);
// });

// db.ref('control').orderByChild('completed').equalTo(null).on("child_added", function(snapshot) {
//     console.log("tmp: " + snapshot.key + " : " + snapshot.val().op);
//  });
 
// db.ref('logs').startAt('Mon Mar 19 2018 23:24:24 GMT-0700 (PDT)').limitToFirst(1).on("child_added", function(snapshot) {
//   console.log("log: " + snapshot.key + " : " + snapshot.val().timestamp);
// });

// db.ref('logs').limitToFirst(1).on("child_added", function(snapshot) {
//     console.log("no order: " + snapshot.key + " : " + snapshot.val().timestamp + snapshot.val().data);
// });

// db.ref('logs').orderByKey().limitToFirst(1).on("child_added", function(snapshot) {
//     console.log("order: " + snapshot.key + " : " + snapshot.val().timestamp + snapshot.val().data);
// });

// db.ref('logs').orderByKey().startAt('-L89COckQ5kTkaJaNBXS').limitToFirst(2).on("child_added", function(snapshot) {
//     console.log("query: " + snapshot.key + " : " + snapshot.val().timestamp + snapshot.val().data);
// });



// }).key;
// var updates = {};
//   updates['/posts/' + newPostKey] = postData;
//   updates['/user-posts/' + uid + '/' + newPostKey] = postData;

//   return firebase.database().ref().update(updates);

// db.ref('logs').set({
//     timestamp: (new Date()).toString(),
//     data: 'from node 1'
// });
