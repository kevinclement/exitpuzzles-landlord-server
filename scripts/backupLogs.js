let fb = new (require('../firebase'))
let fs = require('fs')

let ROOT = getRootFolder('logs')
let cfgName = `${ROOT}/config.json`
let CONFIG = {}
if (fs.existsSync(cfgName)) {
    CONFIG = require(`${ROOT}/config.json`)
}

console.log(`Backup Logs ...`)

let LIMIT = 3;
let TIMEOUT_MS = 3200;

let dbs = ['landlord'];
let tables = ['tmpLog'];
let startKey = '-Lnj1MkZHOWMg_PYqVuD';

let refCount = 0
let dumpCount = 0
let data = {}
let lastKey = ''
let timeout = null
dbs.forEach(db => {
    tables.forEach(table => {
        refCount++;
        let logsRef = fb.db.ref(`/${db}/${table}`).orderByKey().startAt(startKey).limitToFirst(LIMIT);
        console.log(`  dumping ${db}/${table}...`)
        logsRef.on('child_added', (s) => {
            let log = s.val()
            console.log(`${s.key}  : ${log.timestamp}  : ${log.data}`)
            lastKey = s.key

            let tableFolder = `${ROOT}/${db}`
            let fName = `${tableFolder}/${table}.json`
            fs.mkdirSync(tableFolder, { recursive: true })

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
                fs.writeFileSync(fName, JSON.stringify(data, null, 2))
                console.log("DONE.")
                process.exit();
            }, TIMEOUT_MS);
        })
    });
});

function getRootFolder(rootDir) {
    let today = new Date
    let month = today.getUTCMonth() + 1
    let day = today.getUTCDate()

    // zero pad folders
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;

    return `${rootDir}/${today.getUTCFullYear()}/${month}-${day}`
}