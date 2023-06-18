const json2html  = require('json2html');

function APIController(server) {
  const connDBServer = require('../tools/socketIOWrapper')('apiServer');
  const connCP = require('../tools/websocketWrapper')(server);
  var waitingJobs = 0;
  var lockArray = [];
  const { v1: uuidv1, v4: uuidv4, } = require('uuid');

  waitAndGo = (req, res, next) => {
    var index = lockArray.findIndex(item => item == req.body.evse);
    if (index >= 0) {
      res.json({ responseCode: { type: 'error', name: 'wait a while and try again'}, result: [] });
      res.end();
      return;
    }
    else {
      next();
    }
  }

  hScan = async (req, res, next) => {
    waitingJobs++;
    var reqToCP, resultCP;
    //const evseSerial = await connDBServer.sendAndReceive({ action: "GetSerial", evseNickname: req.body.evse });
    var cwjy = { action: "EVSECheck", userId: req.body.user, evseNickname: req.body.evse};
    console.log(JSON.stringify(cwjy));
    console.log(req.body);
    var resultDB = await connDBServer.sendAndReceive(cwjy);
    if(!resultDB || !req.body.user) {
      console.log('result is null');
      res.response = { responseCode: { type: 'error', name: 'wrong parameters'}, result: [] };
      next();
      return;
    }
    var response = { responseCode: { type: 'temp', name: 'temp'}, result: resultDB };
    const evseSerial = resultDB[0].evseSerial;
    /*
    res.response = response;
    next();
    return;
    */

    if(((resultDB[0].status == 'Reserved' || resultDB[0].status == 'Finishing') && resultDB[0].occupyingUserId == req.body.user)
      || resultDB[0].status == 'Available') {
      console.log('scan >> charge');
      lockActionProcess(req.body.evse);

      reqToCP = { messageType: 2, uuid: uuidv1(), action: 'RemoteStartTransaction', pdu: { idTag: req.body.user } };
      //result = await connCP.sendAndReceive(req.body.evse, reqToCP);
      resultCP = await connCP.sendAndReceive(evseSerial, reqToCP);
      console.log('after resolve start charge evse result: ' + JSON.stringify(resultCP));
      if (!resultCP) {
        console.log('timeout timeout');
        response.responseCode = { type: 'error', name: 'temporarily unavailable' };
        //////////////////////////////////////////////
        unlockActionProcess(req.body.evse);
        res.response = response;
        next();
        return;
      }
      if (resultCP.pdu.status == 'Accepted') {
        //cwjy = { action: "StatusNotification", userId: req.body.user, evseSerial: req.body.evse, pdu: { status: 'Preparing' } };
        cwjy = { action: "StatusNotification", userId: req.body.user, evseSerial: evseSerial, pdu: { status: 'Preparing' } };
        console.log('hscanAction: EVSE says OK to charge');
        resultDB = await connDBServer.sendAndReceive(cwjy);
        response.responseCode = { type: 'page', name: 'charging status' };
        response.result[0].status = 'Preparing';
      }
      else {
        console.log('hscanAction: EVSE says Reject ');
        response.responseCode = { type: 'error', name: 'evse problem' };
      }

      cwjy = { action: "NewUserFavo", userId: req.body.user, favo: 'recent' };
      connDBServer.sendOnly(cwjy);
      unlockActionProcess(req.body.evse);
    }
    else if (resultDB[0].status == 'Reserved' && resultDB[0].occupyingUserId != req.body.user) {
      console.log('scan >> other user reserved this. wait for 15 minutes')
      response.responseCode = { type: 'toast', name: 'reserved by other' };
    }
    else if (resultDB[0].status == 'Finishing' && resultDB[0].occupyingUserId != req.body.user) {
      console.log('scan >> Angry');
      response.responseCode = { type: 'popup', name: 'ask angry' };
      /*
      cwjy = { action: 'Angry', userId: req.body.user, evseSerial: req.body.evse };
      result = await connDBServer.sendAndReceive(cwjy);
      console.log('angry: ' + result);
      if (result)
        response.responseCode = 'Accepted';
      else
        response.responseCode = 'Done Already';
        */
    }
    else if (resultDB[0].status == 'Charging' && resultDB[0].occupyingUserId == req.body.user) {
      console.log('scan >> cancel');
      response.responseCode = { type: 'popup', name: 'ask cancel' };
      /*
      reqToCP = { messageType: 2, uuid: uuidv1(), action: 'RemoteStopTransaction', pdu: { transactionId: result.trxId } };
      result = await connCP.sendAndReceive(req.body.evse, reqToCP);
      if (result) {
        if (result.pdu.status == 'Accepted') {
          response.responseCode = 'Accepted';
          response.result[0].status = 'Finishing';
        }
        else {
          response.responseCode = result.pdu.status;
        }
      }
      else {
        response.responseCode = 'Unavailable';
        console.log(`Communication Error. EVSE isn't responnding.`);
      }
      */
    }
    else if (resultDB[0].status == 'Charging' && resultDB[0].occupyingUserId != req.body.user){
      console.log('scan >> Alarm');
      response.responseCode = { type: 'popup', name: 'ask alarm' };
      /*
      cwjy = { action: 'Alarm', userId: req.body.user, evseSerial: req.body.evse };
      connDBServer.sendOnly(cwjy);
      response.responseCode = 'Accepted';
      */
    }
    else if (resultDB[0].status == 'Unavailable') {
      response.responseCode = { type: 'error', name: 'temporarily unavailable' };
      console.log('scan >> evse is not availble.')
    }
    else if (resultDB[0].status == 'Faulted') {
      response.responseCode = { type: 'error', name: 'evse problem' };
      console.log('scan >> evse is dead.')
    }
    else {
      response.responseCode = { type: 'error', name: 'dont know what the fuck is going on' };
      console.log('error or special case');
    }
    res.response = response;
    next();
  }

  hAction = async (req, res, next) => {
    waitingJobs++;
    var cwjy, result, reqToCP;
    var response = { responseCode: { type: 'temp', name: 'temp'}, result: [] };
    const evseSerial = await connDBServer.sendAndReceive({ action: 'GetSerial', evseNickname: req.body.evse });

    switch (req.body.action) {
      case 'Reserve':
        lockActionProcess(req.body.evse);
        //cwjy = { action: 'Reserve', userId: req.body.user, evseSerial: req.body.evse };
        cwjy = { action: 'Reserve', userId: req.body.user, evseSerial: evseSerial };
        connDBServer.sendOnly(cwjy);

        reqToCP = { messageType: 2, uuid: uuidv1(), action: 'DataTransfer', pdu: { vendorId: 'hclab.temp', data: 'yellow' } };
        //connCP.sendTo(req.body.evse, reqToCP);
        connCP.sendTo(evseSerial, reqToCP);

        response.responseCode = { type: 'toast', name: 'reserve ok' };
        unlockActionProcess(req.body.evse);
        break;
      case 'Blink':
        reqToCP = { messageType: 2, uuid: uuidv1(), action: 'DataTransfer', pdu: { vendorId: 'com.hclab', data: 'blink' } };
        //connCP.sendTo(req.body.evse, reqToCP);
        connCP.sendTo(evseSerial, reqToCP);
        response.responseCode = { type: 'toast', name: 'blink ok' };
        break;
      case 'Cancel':
        var trxId;
        cwjy = { action: 'ChargingStatus', userId: req.body.user };
        result = connDBServer.sendAndReceive(cwjy);
        for (var i in result) {
          //if(result[i].evseSerial == req.body.evseSerial)
          if(result[i].evseSerial == evseSerial)
            trxId = result[i].trxId;
        }

        reqToCP = { messageType: 2, uuid: uuidv1(), action: 'RemoteStopTransaction', pdu: { transactionId: trxId } };
        //result = await connCP.sendAndReceive(req.body.evse, reqToCP);
        result = await connCP.sendAndReceive(evseSerial, reqToCP);
        if (result) {
          if (result.pdu.status == 'Accepted') {
            //cwjy = { action: '', userId: req.body.user, evseSerial: req.body.evse };
            //connDBServer.sendOnly(cwjy);
            response = { responseCode: { type: 'page', name: 'charging canceled'}, result: [{ status: 'Finishing'}]};
            //response.result = [{ status: 'Finishing'} ];
          }
          else {
            // EVSE says no
            response.responseCode = { type: 'error', name: 'evse problem' };
          }
        }
        else {
          response.responseCode = { type: 'error', name: 'temporarily unavailable' };
          console.log(`Communication Error. EVSE isn't responnding.`);
        }
        break;
      case 'Alarm':
        //cwjy = { action: 'Alarm', userId: req.body.user, evseSerial: req.body.evse };
        cwjy = { action: 'Alarm', userId: req.body.user, evseSerial: evseSerial };
        connDBServer.sendOnly(cwjy);
        response.responseCode = { type: 'toast', name: 'alarm ok' };
        break;
      case 'Angry':
        //cwjy = { action: 'Angry', userId: req.body.user, evseSerial: req.body.evse };
        cwjy = { action: 'Angry', userId: req.body.user, evseSerial: evseSerial };
        result = await connDBServer.sendAndReceive(cwjy);
        console.log('angry: ' + result);
        if (result)
          response.responseCode = { type: 'toast', name: 'angry ok' };
        else
          response.responseCode = { type: 'toast', name: 'angry done already' };
        break;
    }

    res.response = response;
    next();
  }

  getUserStatus = async (req, res, next) => {
    waitingJobs++;
    var cwjy = { action: "UserStatus", userId: req.params.user };
    var result = await connDBServer.sendAndReceive(cwjy);
    res.response = { responseCode: { type: 'page', name: 'user status' }, result: result};
    next();

  }
  getUserChargingStatus = async (req, res, next) => {
    waitingJobs++;
    var cwjy = { action: "ChargingStatus", userId: req.params.user};
    var result = await connDBServer.sendAndReceive(cwjy);

    for (var i in result) {
      var elapsed = new Date(Date.now() - new Date(result[i].started));
      result[i].elapsed = elapsed.getHours() + ":" + elapsed.getMinutes() + ":" + elapsed.getSeconds();
      result[i].currentSoc = result[i].bulkSoc + (result[i].meterNow - result[i].meterStart);
      result[i].price = (result[i].priceHCL + result[i].priceHost) * (result[i].meterNow - result[i].meterStart);
    }

    res.response = { responseCode: { type: 'page', name: 'charging status' }, result: result};
    next();
  }

  getUserChargingHistory = async (req, res, next) => {
    waitingJobs++;
    var cwjy = { action: "UserHistory", userId: req.params.user};
    var result = await connDBServer.sendAndReceive(cwjy);
    if(!result)
      res.response = { responseCode: { type: 'error', name: 'wrong parameters' }, result: []};
    else
      res.response = { responseCode: { type: 'page', name: 'user history' }, result: result };

    next();
  }

  getUserRecent = async (req, res, next) => {
    waitingJobs++;
    var cwjy = { action: "GetUserFavo", userId: req.params.user, favo: 'recent'};
    var result = await connDBServer.sendAndReceive(cwjy);
    if(!result)
      res.response = { responseCode: { type: 'error', name: 'wrong parameters' }, result: []};
    else
      res.response = { responseCode: { type: 'page', name: 'recently visited' }, result: result };

    next();
  }
  getUserFavo = async (req, res, next) => {
    waitingJobs++;
    var cwjy = { action: "GetUserFavo", userId: req.params.user, favo: 'favorite'};
    var result = await connDBServer.sendAndReceive(cwjy);
    if(!result)
      res.response = { responseCode: { type: 'error', name: 'wrong parameters' }, result: []};
    else
      res.response = { responseCode: { type: 'page', name: 'user favorite' }, result: result };

    next();
  }

  newUserFavo = async (req, res, next) => {
    waitingJobs++;
    if (!req.body) {
      res.response = { responseCode: { type: 'error', name: 'wrong parameters' }, result: []};
      next();
      return;
    }

    var cwjy = { action: "NewUserFavo", userId: req.body.user, chargePointId: req.body.cp, favo: 'favorite'};
    var result = await connDBServer.sendAndReceive(cwjy);
    //console.log('put result: ' + JSON.stringify(result));
    if(!result)
      res.response = { responseCode: { type: 'popup', name: 'already done' }, result: []};
    else
      res.response = { responseCode: { type: 'popup', name: 'add ok' }, result: [] };

    next();
  }

  delUserFavo = async (req, res, next) => {

  }
  getChargePointInfo = async (req, res, next) => {
    waitingJobs++;
    var cwjy;
    if (req.params.cp) {
      cwjy = { action: 'ShowAllEVSE', chargePointId: req.params.cp};
    }
    else {
      res.response = { responseCode: { type: 'error', name: 'wrong parameters' }, result: []};
      next();
      return;
    }
    var result = await connDBServer.sendAndReceive(cwjy);
    res.response = { responseCode: { type: 'page', name: 'cp info' }, result: result};
    next();

  }

  getChargePointList = async (req, res, next) => {
    if (req.query.lat && req.query.lng && req.query.rng) {
      cwjy = { action: 'ShowAllCPbyLoc', lat: req.query.lat, lng: req.query.lng, rng: req.query.rng };
    }
    else if(req.query.name) {
      cwjy = { action: 'ShowAllCPbyName', name: req.query.name};
    }
    var result = await connDBServer.sendAndReceive(cwjy);
    res.response = { responseCode: { type: 'page', name: 'cp list' }, result: result};
    next();

  }

  postDamageReport = (req, res, next) => {
    //////////////////////////////////////////////
    // images, writings
    cwjy = { action: 'Report', evseSerial: req.params.evse };
    result = connDBServer.sendOnly(cwjy);
    response.responseCode = { responseCode: { type: 'popup', name: 'report ok' }, result: [] };

    res.response = response;
    next();
  }

  evseBoot = async (req, origin) => {
    req.evseSerial = origin;
    var conf = { messageType: 3, uuid: req.uuid, action: req.action, pdu: {} };
    conf.pdu = await connDBServer.sendAndReceive(req);
    if (conf.pdu.status !== 'Accepted') {
      console.log(`This EVSE(${origin}) is not authorized.`);
      connCP.removeConnection(origin);
      return;
    }
    connCP.sendTo(origin, conf);
  }

  evseRequest = async (req, origin) => {
    req.evseSerial = origin;
    var conf = { messageType: 3, uuid: req.uuid, action: req.action, pdu: {} };
    switch (req.action) {
      case 'Heartbeat':
      case 'MeterValues':
      case 'StatusNotification':
      case 'Authorize':
      case 'StartTransaction':
      case 'StopTransaction':
        conf.pdu = await connDBServer.sendAndReceive(req);
        break;
      case 'ShowArray':       // testOnly
        connCP.showAllConnections();
        break;
      case 'WhatsMySerial':       // testOnly
        break;
      case 'Quit':
        connCP.removeConnection(origin);
        return;
    }
    connCP.sendTo(origin, conf);
  }

  csmsBasic = (req, res, next) => {
    console.log('/host');
  }

  csmsReport = (req, res, next) => {
    console.log('/host/report');
  }

  csmsControl = (req, res, next) => {
    console.log('/host/:userId' + req.params.userId);
  }


  

  writeResponse = (req, res) => {
    waitingJobs--;
    if (req.query.html || req.body.html) {
      var html = json2html.render(res.response);
      res.write(html);
    }
    else
      res.json(res.response);

    res.end();
  }

  lockActionProcess = (key) => {
    var found = lockArray.find(item => item == key);
    if(found) {
      console.log (`apiController: [${key}] is already locked`);
      return false;
    }
    console.log('lock: ' + key);
    lockArray.push(key);
    return true;
  }

  unlockActionProcess = (key) => {
    console.log('unlock: ' + key);
    var index = lockArray.findIndex(item => item == key);
    if (index >= 0) {
      lockArray.splice(index, 1);
    }
    else {
      console.log(`apiController: Can't find [${key}].`);
    }
  }

  consoleCommand = () => {
    var stdin = process.openStdin();
    stdin.on('data', (input) => {
      command = String(input).slice(0, input.length - 1);
      switch (command) {
        case 'empty':
          lockArray.length = 0;
          console.log('Array for evse semaphore is just emptied.');
          break;
        case 'socketlist':
          connCP.showAllConnections();
          break;
        case 'forwardlist':
          connCP.showAllForwards();
          break;
        case 'waiting':
          console.log('waiting jobs: ' + waitingJobs);
      }
    });
  }

  const apiController = {
    waitAndGo,
    hScan,
    hAction,
    getUserStatus,
    getUserChargingStatus,
    getUserChargingHistory,
    getUserRecent,
    getUserFavo,
    newUserFavo,
    delUserFavo,
    getChargePointInfo,
    getChargePointList,
    postDamageReport,
    evseBoot,
    evseRequest,
    csmsBasic,
    csmsReport,
    csmsControl,
    writeResponse
  }

  connCP.enlistForwarding('general', evseRequest);
  connCP.enlistForwarding('boot', evseBoot);
  consoleCommand();

  return apiController;
}

module.exports = APIController;