
module.exports = {
    getLocalPort(cb) {
        let port = null

        require('http').get('http://localhost:4040/api/tunnels', (res) => {
            res.setEncoding('utf8');
            res.on('data', function (body) {
        
                try {
                    var json = JSON.parse(body);
                    var url = json.tunnels[0].public_url
                    var port = url.split(':')[2]
                    cb(port)
                } catch (e) {
                    console.error('ERROR: problems parsing response: ' + e.message);
                    cb(null)
                }
            });
        }).on('error', (e) => {
            console.error(`ERROR: trouble fetching: ${e.message}`);
            cb(null)
        });
    }
}