const BluetoothSerialPort = require('bluetooth-serial-port');
const rfcomm = new BluetoothSerialPort.BluetoothSerialPort();
var dataBuffer = "";

// test device: 24:0A:C4:05:C5:E6 
let address = '24:0A:C4:05:C5:E6'
let channel = 2;  // esp32 has serial on channel 2

rfcomm.connect(address, channel, function() {
  console.log('connected');

  // simulate sending clue
  setTimeout(() => {
    console.log('sending clue');
    rfcomm.write(new Buffer("this is test#and this line 2\n", 'utf-8'), function(err, bytesWritten) {
      if (err) console.log(err);
    });
  }, 2000);


  rfcomm.on('data', function(buffer) {
    dataBuffer = dataBuffer + buffer.toString('utf-8');

    if(dataBuffer.indexOf("\n") != -1){
      console.log("New incoming string");
      console.log("String = " + dataBuffer);
      dataBuffer = "";
    }

  });

});

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    console.log('key pressed')

    rfcomm.write(new Buffer(d, 'utf-8'), function(err, bytesWritten) {
      if (err) console.log(err);
    });
});