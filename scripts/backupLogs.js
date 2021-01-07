let fb = new (require('../firebase'))
let fs = require('fs')
var crypto = require('crypto');

let ROOT = getRootFolder('logs')
let CONFIG_FNAME = `${ROOT}/config.json`

let CONFIG = { runs: 0 }
if (fs.existsSync(CONFIG_FNAME)) {
    CONFIG = require(`./${CONFIG_FNAME}`)
}
CONFIG.runs++;

let LIMIT = 3;
let TIMEOUT_MS = 3200;
let DB_ROOT_PATH = 'landlord/tmpLog'
let data = {}
let timeout = null

dumpLogs(DB_ROOT_PATH, CONFIG.lastKey, CONFIG.runs)

function dumpLogs(logsPath, lastKey, runNumber) {
    let fName = `${ROOT}/logs.${pad(runNumber, 4)}.json`;
    
    // should never happen, but lets protect
    if (fs.existsSync(fName)) {
        console.log(`ERROR: file ${fName} already exists, I dont want to blow it away, Exiting.`);
        process.exit();
    }

    console.log(`Backup Logs to ${fName}...`)
    console.log(`  dumping ${logsPath}...`)

    let logsRef = fb.db.ref(`/${logsPath}`).orderByKey().limitToFirst(LIMIT);

    if (CONFIG.lastKey && CONFIG.lastKey != '') {
        logsRef = logsRef.startAt(CONFIG.lastKey)
    }

    logsRef.on('child_added', (s) => {
        let log = s.val()

        // if lastKey in config, skip first element since we'll already have it in last backup
        if (s.key == CONFIG.lastKey) {
            console.log(`skipping already stored ${s.key}...`)
            return;    
        }

        console.log(`${s.key}  : ${log.timestamp}  : ${log.data}`)
        CONFIG.lastKey = s.key

        // add to our json object
        data[s.key] = s.toJSON();

        if (timeout) {
            clearTimeout(timeout)
        }

        // Nerd.  I don't know when to tell we've hit the end other then just setting
        // a timer to timeout.  I cant just count limit because we might not reach that many
        // don't know of a better way right now
        timeout = setTimeout(() =>
        {
            fs.mkdirSync(ROOT, { recursive: true })
            fs.writeFileSync(CONFIG_FNAME, JSON.stringify(CONFIG, null, 2))
            fs.writeFileSync(fName, JSON.stringify(data, null, 2))
            console.log("DONE.")
            process.exit();
        }, TIMEOUT_MS);
    })
}

function getRootFolder(rootDir) {
    let today = new Date
    let month = today.getUTCMonth() + 1
    let day = today.getUTCDate()

    // zero pad folders
    month = pad(month, 2)
    day = pad(day, 2)

    return `${rootDir}/${today.getUTCFullYear()}/${month}-${day}`
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}