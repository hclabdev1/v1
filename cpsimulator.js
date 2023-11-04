var wsClient = require('websocket').client;
const { v1: uuidv1, } = require('uuid');
var ongoingtrx;
var client = new wsClient();

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

client.on('connectFailed', function(error) {
  console.log('Connect Error' + error.toString());
});

var eol, evseser;

function init() {
  var target = process.argv[2];
  evseser = process.argv[3];
  var url;

  if (process.platform == 'win32') {
    eol = 2;
    console.log('Running on Windows');
  }
  else {
    eol = 1;
    console.log('Running on Linux or MacOS');
  }

  if (target == '' || evseser == '') {
    console.log('usage: wstest.js {target} {evse}\n default option submitted (local, 7a01-0001');
    target = 'local';
    evseser = '7a01-0001';
  }

  if(target == 'local') {
    //url = 'wss://127.0.0.1:3001/' + evseser;
    url = 'ws://127.0.0.1:3003/' + evseser;
    //client.connect('wss://127.0.0.1:3001/', 'hclab-protocol', evseser);
  }
  else if(target == 'aws') {
    //url = 'wss://34.207.158.106:3001/' + evseser;
    url = 'ws://34.207.158.106:3003/' + evseser;
    //client.connect('wss://34.207.158.106:3001/', 'hclab-protocol', evseser);
  }
  else if (target == 'mac') {
    //url = 'wss://10.20.20.28:3001/' + evseser;
    url = 'ws://10.20.20.28:3003/' + evseser;
    //client.connect('wss://10.20.20.28:3001', 'hclab-protocol', evseser);
  }
  else {
    console.log('usage: wstest.js {target} {evse}');
    process.exit();
  }
  //client.connect(url, 'hclab-protocol');
  client.connect(url, '');
}

init();

client.on('connect', (connection) => {
  var repeatCount = 0, repeats = 0;
  var command, last, lastid, sending;
  var availability = 'Accepted';
  var meterInterval;

  function sendAndLog(msg) {
    connection.send(msg);
    console.log('sending: ' + msg);
    last = (JSON.parse(msg)[0] == 2) ? JSON.parse(msg)[2] : null;
  }

  function heartbeat() {
    var hb = `[2, "${uuidv1()}", "Heartbeat", {}]`;
    sendAndLog(hb);
  }

  function metervalue(trxid, meterstart) {
    var sampled = meterstart + (0.1 * repeats++);
    var A = Math.floor(Math.random() * 10) + 20;
    var V = Math.floor(Math.random() * 30 - 15) + 220;
    var T = Math.floor(Math.random() * 40) + 20;
    var mv = `[2, "${uuidv1()}", "MeterValues",  { "connectorId": 1, "transactionId": ${trxid},
                   "meterValue": [
                      {"timestamp": "${Math.floor(Date.now()/1000)}", 
                        "sampledValue": [{"measurand": "Energy.Active.Import.Register", "unit": "kWh", "value": ${sampled}},
                                         {"measurand": "Energy.Active.Import.Interval", "unit": "kWh", "value": 0.3},
                                         {"measurand": "Current.Import", "unit": "A", "value": ${A}},
                                         {"measurand": "Voltage", "unit": "V", "value":${V}},
                                         {"measurand": "Temperature", "unit": "C", "value":${T}}
                      ]}]}]`;
    sendAndLog(mv);
  }

  sending = `[2, "${uuidv1()}", "BootNotification", {"chargePointModel":"hcLab1", "chargePointVendor": "hclab"}]`;
  sendAndLog(sending);
  
  var stdin = process.openStdin();
  stdin.on('data', (input) => {
    command = String(input).slice(0, input.length - eol).split(" ");
    sending = '';
    switch (command[0]) {
      case 'list':
        console.log('auth heart start stop avail reserve meter show res accept reject repeat');
        break;
      case 'auth':
        if(command[1])
          sending = `[2, "${uuidv1()}", "Authorize", {"idTag":"${command[1]}"}]`;
        else
          console.log('usage: auth {userid}');
        break;
      case 'heart':
        sending = `[2, "${uuidv1()}", "Heartbeat", {}]`;
        break;
      case 'start':
        if(command[1] && command[2] && command[3])
          sending = `[2, "${uuidv1()}", "StartTransaction", {"connectorId": 1, 
                          "idTag":"${command[1]}", "meterStart": ${command[3]}, "timestamp": ${Math.floor(Date.now()/1000)}, "ressoc": "${command[2]}", "fullSoc": 72.7 }]`;
        else
          console.log('usage: start {userid} {bulkSoc} {meterStart}');
        break;
      case 'stop':
        if(command[1] && command[2] && command[3])
          sending = `[2, "${uuidv1()}", "StopTransaction", {"transactionId": "${command[1]}", 
                          "meterStop":${command[2]}, "timestamp": ${Math.floor(Date.now()/1000)}, "reason": "${command[3]}"}]`;
        else
          console.log('usage: stop {transactionId} {meterStop} {reason}');
        break;
      case 'status':
        if(command[1])
          sending = `[2, "${uuidv1()}", "StatusNotification", {"connectorId": 1,
                            "errorCode":"${command[1]}", "status":"${command[2]}", "timestamp": ${Math.floor(Date.now()/1000)}}]`;
        else
          console.log('usage: status {errorCode} {Available Preparing Charging Finishing Reserved Unavailable}');
        break;
      case 'meter':
        if(command[1])
          metervalue(command[1], command[2]);
        else
          console.log('usage: meter {trxId} {meterValue}');
        break;
      case 'show':
        sending = `[2, "${uuidv1()}", "ShowArray", {}]`;
        break;
      case 'serial':
        sending = `[2, "${uuidv1()}", "WhatsMySerial", {}]`;
        break;
      case 'response':
        sending = (command[1]) ? `[3, "${lastid}", {"status": "Rejected"}]` : `[3, "${lastid}", {"status": "Accepted"}]`;
        break;
      case 'repeat':
        repeatCount = 0;
        repeats = Number(command[1]);
        sending = '';
        if(repeats > 0) {
          repeat();
        }
        else
          console.log('usage: repeat {repeat count}');
        break;
      case 'quit':
        sending = `[2, "${uuidv1()}", "Quit", {}]`;
        process.exit();
    }

    if (sending) {
      sendAndLog(sending);
    }

    function repeat() {
      if (repeatCount < repeats)
        setTimeout(repeat, 1000);
      connection.send(`[2, "${uuidv1()}", "HeartBeat", {}]`);
      repeatCount++;
    }

  });

  let meterStart=0, bulkStart=0;

  connection.on('message', (message) => {
    console.log('rcved: ' + JSON.stringify(message.utf8Data));
    var msgType = JSON.parse(message.utf8Data)[0];
    var msgid = JSON.parse(message.utf8Data)[1];
    var action = (msgType == 2) ? JSON.parse(message.utf8Data)[2] : last;
    var payload = (msgType == 2) ? JSON.parse(message.utf8Data)[3] : JSON.parse(message.utf8Data)[2];
    //console.log(`msgType: ${msgType} action: ${action} last: ${last}`);
    switch(action) {
      case 'RemoteStartTransaction':
        sending = `[3, "${msgid}", {"status": "${availability}"}]`;
        sendAndLog(sending);
        meterStart = Math.floor(Math.random() * (3000) * 100) / 100;
        bulkStart = Math.floor(Math.random() * 70 * 100) / 100 + 1;
        sending = `[2, "${uuidv1()}", "StartTransaction", {"connectorId": 1, "idTag": "${payload.idTag}", 
                                                           "meterStart": ${meterStart}, "timestamp": ${Math.floor(Date.now()/1000)},
                                                           "ressoc": ${bulkStart} }]`;
        setTimeout(sendAndLog, 2000, sending);
        //sendAndLog(sending);
        repeats = 1;
        break;
      case 'RemoteStopTransaction':
        sending = `[3, "${msgid}", {"status": "${availability}"}]`;
        sendAndLog(sending);
        var meter = meterStart + (Math.random() * 60);
        sending = `[2, "${uuidv1()}", "StopTransaction", {"transactionId": "${payload.transactionId}", "meterStop": ${meter}, 
                                                          "timestamp": ${Math.floor(Date.now()/1000)}, "reason": "1"}]`;
        sendAndLog(sending);
        break;
      case 'ChangeAvailability':
        availability = (payload.type == 'Operative') ? 'Accepted' : 'Rejected';
        sendAndLog(sending);
        break;
      case 'DataTransfer':
        sending = `[3, "${msgid}", {"status": "Accpeted"}]`;
        sendAndLog(sending);
        break;
      case 'StartTransaction':
        ongoingtrx = payload.transactionId;
        meterInterval = setInterval(metervalue, 60 * 1000, ongoingtrx, meterStart);
        break;
      case 'StopTransaction':
        clearInterval(meterInterval);
        break;
      case 'ChangeConfiguration':
      case 'ClearCache':
      case 'Reset':
      case 'Unlock':
        break;
      case 'BootNotification':
        setInterval(heartbeat, payload.interval * 1000);
        break;
    }
  });


});
