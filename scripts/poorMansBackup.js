let fb = new (require('../firebase'))
let fs = require('fs')

let ROOT = getRootFolder();

console.log(`Backup up DBs ...`)

let dbs = ['landlord', 'museum'];
let tables = ['devices','status'];

let refCount = 0;
let dumpCount = 0;
dbs.forEach(db => {
    tables.forEach(table => {
        refCount++;
        let tableRef = fb.db.ref(`/${db}/${table}`)
        tableRef.once("value", (s) => {
            console.log(`  dumping ${db}/${table}...`)
            let tableFolder = `${ROOT}/${db}`
            let fName = `${tableFolder}/${table}.json`
            let val = s.val()

            fs.mkdirSync(tableFolder, { recursive: true })
            fs.writeFileSync(fName, JSON.stringify(val, null, 2))

            if (++dumpCount == refCount) {
                console.log("DONE.")
                process.exit();
            }
        })
    });
});

function getRootFolder() {
    let rootDir = 'backup'
    let today = new Date
    let month = today.getUTCMonth() + 1
    let day = today.getUTCDate()

    // zero pad folders
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;

    return `${rootDir}/${today.getUTCFullYear()}/${month}-${day}`
}