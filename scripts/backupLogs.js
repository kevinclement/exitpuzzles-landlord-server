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
let DB_ROOT_PATH = 'landlord/tmpLog'
let data = {}
let last_work_fname = '';
let last_work_key = '';

// set timer to check if we're done with work
// and if so dump json to file and exit
setInterval(() => {
    // sync with work being done on query
    // NOTE: I might not understand how the scheduler works
    if (last_work_key == '') return;

    CONFIG.lastKey = last_work_key
    
    fs.mkdirSync(ROOT, { recursive: true })
    fs.writeFileSync(CONFIG_FNAME, JSON.stringify(CONFIG, null, 2))
    fs.writeFileSync(last_work_fname, JSON.stringify(data, null, 2))
    console.log("DONE.")
    process.exit();
}, 250);

dumpLogs(DB_ROOT_PATH, CONFIG.lastKey, CONFIG.runs)

function dumpLogs(logsPath, lastKey, runNumber) {
    let fName = `${ROOT}/logs.${pad(runNumber, 4)}.json`;
    
    // TODO: better way to do this?
    last_work_fname = fName
    
    // should never happen, but lets protect
    if (fs.existsSync(fName)) {
        console.log(`ERROR: file ${fName} already exists, I dont want to blow it away, Exiting.`);
        process.exit();
    }

    console.log(`Backup Logs to ${fName}...`)
    console.log(`  dumping ${logsPath}...`)

    let logsRef = fb.db.ref(`/${logsPath}`).orderByKey().limitToFirst(LIMIT);

    if (lastKey && lastKey != '') {
        logsRef = logsRef.startAt(lastKey)
    }

    logsRef.on('child_added', (s) => {
        let log = s.val()

        // if lastKey in config, skip first element since we'll already have it in last backup
        if (s.key == lastKey) {
            console.log(`skipping already stored ${s.key}...`)
            return;    
        }

        console.log(`${s.key}  : ${log.timestamp}  : ${log.data}`)

        // add to our json object
        data[s.key] = s.toJSON();

        // sync with interval 
        //   NOTE: I need to learn how this works in nodejs
        last_work_key = s.key
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