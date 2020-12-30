const BluetoothSerialPort = require('bluetooth-serial-port');
const rfcomm = new BluetoothSerialPort.BluetoothSerialPort();
var dataBuffer = "";

rfcomm.on('found', function (address, name) {
    console.log('found device:', name, 'with address:', address);
    
    rfcomm.findSerialPortChannel(address, function(channel) {
      console.log('found channel: ' + address + " channel " + channel)
      // found channel: 00:12:10:26:19:32 channel 1
      //   esp test device: 24:0A:C4:05:C5:E6 

      rfcomm.connect(address, channel, function() {
          console.log('connected');

          rfcomm.on('data', function(buffer) {
            
            dataBuffer = dataBuffer + buffer.toString('utf-8');

            if(dataBuffer.indexOf("\n") != -1){
              console.log("New incoming string");
              console.log("String = " + dataBuffer);
              dataBuffer = "";
            }

          });

        //   rfcomm.on('data', function(buffer) {
        //     console.log(buffer.toString('utf-8'));
        //   });
      });
    });
});

rfcomm.on('finished', function () {
  console.log('inquiry finished');
});

console.log('start inquiry');
rfcomm.inquire();



// var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();

// const rfcomm = new BluetoothSerialPort.BluetoothSerialPort();
// rfcomm.listPairedDevices(function (list) {
// 		console.log(JSON.stringify(list,null,2));
// });

// btSerial.on('found', function(address, name) {
//     console.log('bt found: ' + address + " name: " + name);

//    btSerial.findSerialPortChannel(address, function(channel) {

//     console.log('found channel: ' + address + " channel " + channel)

//     btSerial.connect(address, channel, function() {
//       console.log('connected');

//     //     //    btSerial.write(new Buffer('my data', 'utf-8'), function(err, bytesWritten) {
//     //     //        if (err) console.log(err);
//     //     //    });

//             btSerial.on('data', function(buffer) {
//                 console.log(buffer.toString('utf-8'));
//             });
//         }, function () {
//             console.log('cannot connect');
//     });

//     //    // close the connection when you're ready
//     //    btSerial.close();
//    }, function() {
//        console.log('found nothing');
//    });
// });

// btSerial.inquire();

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    console.log('key pressed')

    rfcomm.write(new Buffer('opt1', 'utf-8'), function(err, bytesWritten) {
        if (err) console.log(err);
    });
});