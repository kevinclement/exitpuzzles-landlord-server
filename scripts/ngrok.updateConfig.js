// This is helper script that will pull out of the firebase db the port
// and update the ssh config on local machine so you can ssh to the pi box

let fb = new (require('../firebase'))
fs = require('fs')

process.stdout.write('Getting ngrok port from fb...')

fb.db.ref('status').once("value", function(snapshot) {
    let status = snapshot.val()
    let port = status.ngrok

    console.log(` found:${port}`)

    process.stdout.write(`Updating ssh config...`);

    // NOTE: do I need to do something different on mac for this?
    let home = process.env.HOME
    let config = home + '/.ssh/config' 

    fs.readFile(config, 'utf8', function (err, data) {
        if (err) {
          return console.log('\nERROR: trouble reading ssh config file');
        }

        // replace port in data
        let newdata = data.replace(/Port \d+/g, 'Port ' + port);

        fs.writeFile(config, newdata, function (err) {
            if (err) return console.log('\n' + err);

            console.log(`DONE`)
            console.log()
            console.log('To connect: ssh pi')

            // release firebase, otherwise it will keep process open
            fb.db.goOffline()
        });
    });
});