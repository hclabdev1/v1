const json2html  = require('json2html');

function APIController(server) {
  const connDBServer = require('../lib/socketIOWrapper')('apiServer');
  const connDBServer2 = require('../lib/socketIOWrapper')('csms');
  const connCP = require('../lib/websocketWrapper')(server);
  var waitingJobs = 0;
  var lockArray = [];
  const { v1: uuidv1, v4: uuidv4, } = require('uuid');
  const fs = require('fs');

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
    var cwjy = { action: "EVSECheck", userId: req.body.user, evseNickname: req.body.evse};
    console.log('req.body: ' + JSON.stringify(req.body));
    var resultDB = await connDBServer.sendAndReceive(cwjy);
    if(!resultDB || !req.body.user) {
      console.warn('result is null');
      res.response = { responseCode: { type: 'error', name: 'no data'}, result: [] };
      next();
      return;
    }
    var response = { responseCode: { type: 'temp', name: 'temp'}, result: resultDB };
    const evseSerial = resultDB[0].evseSerial;

    if(((resultDB[0].status == 'Reserved' || resultDB[0].status == 'Finishing') && resultDB[0].occupyingUserId == req.body.user)
      || resultDB[0].status == 'Available') {
      console.log('scan >> charge');
      lockActionProcess(req.body.evse);

      reqToCP = { messageType: 2, uuid: uuidv1(), action: 'RemoteStartTransaction', pdu: { idTag: req.body.user , connectorId: 1} };
      resultCP = await connCP.sendAndReceive(evseSerial, reqToCP);
      if (!resultCP) {
        console.log('timeout timeout');
        response.responseCode = { type: 'error', name: 'temporarily unavailable' };
        unlockActionProcess(req.body.evse);
        res.response = response;
        next();
        return;
      }
      if (resultCP.pdu.status == 'Accepted') {
        console.log('hscanAction: EVSE says OK to charge');
        // for instant action
        //cwjy = { action: "StatusNotification", userId: req.body.user, evseSerial: evseSerial, pdu: { status: 'Preparing' } };
        //resultDB = await connDBServer.sendAndReceive(cwjy);
        response.responseCode = { type: 'page', name: 'charging status' };
        response.result[0].status = 'Preparing';
      }
      else {
        console.log('hscan: EVSE says Reject ');
        response.responseCode = { type: 'error', name: 'evse problem' };
      }

      cwjy = { action: "NewUserFavo", userId: req.body.user, evse: req.body.evse, favo: 'recent' };
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
      /*for instant action
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
      /*    for instant action
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
      /* for instant action
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
    result = await connDBServer.sendAndReceive({ action: 'GetSerial', evseNickname: req.body.evse });
    if(!result) {
      response.responseCode = { type: 'error', name: 'no result' };
      res.response = response;
      next();
    }
    const evseSerial = result[0].evseSerial;

    switch (req.body.action) {
      case 'Charge':
        break;
      case 'Reserve':
        lockActionProcess(req.body.evse);
        cwjy = { action: 'Reserve', userId: req.body.user, evseSerial: evseSerial };
        connDBServer.sendOnly(cwjy);

        reqToCP = { messageType: 2, uuid: uuidv1(), action: 'DataTransfer', pdu: { vendorId: 'com.hclab', data: 'yellow' } };
        connCP.sendTo(evseSerial, reqToCP);

        response.responseCode = { type: 'toast', name: 'reserve ok' };
        unlockActionProcess(req.body.evse);
        break;
      case 'Blink':
        reqToCP = { messageType: 2, uuid: uuidv1(), action: 'DataTransfer', pdu: { vendorId: 'com.hclab', data: 'blink' } };
        connCP.sendTo(evseSerial, reqToCP);
        response.responseCode = { type: 'toast', name: 'blink ok' };
        break;
      case 'Cancel':
        var trxId;
        cwjy = { action: 'ChargingStatus', userId: req.body.user };
        result = await connDBServer.sendAndReceive(cwjy);
        if(result[0].evseSerial == evseSerial) {
          trxId = result[0].trxId;
        }
        else {
          console.log('parameter error or wrong record');
        }

        reqToCP = { messageType: 2, uuid: uuidv1(), action: 'RemoteStopTransaction', pdu: { transactionId: trxId } };
        result = await connCP.sendAndReceive(evseSerial, reqToCP);
        if (result) {
          response = (result.pdu.status == 'Accepted')
                     ? { responseCode: { type: 'page', name: 'charging canceled'}, result: [{ status: 'Finishing'}]}
                     : { responseCode: { type: 'error', name: 'evse problem'}};
        }
        else {
          response.responseCode = { type: 'error', name: 'temporarily unavailable' };
          console.log(`Communication Error. EVSE isn't responnding.`);
        }
        break;
      case 'Alarm':
        cwjy = { action: 'Alarm', userId: req.body.user, evseSerial: evseSerial };
        connDBServer.sendOnly(cwjy);
        response.responseCode = { type: 'toast', name: 'alarm ok' };
        break;
      case 'Angry':
        cwjy = { action: 'Angry', userId: req.body.user, evseSerial: evseSerial };
        result = await connDBServer.sendAndReceive(cwjy);
        console.log('angry: ' + result);
        response.responseCode = (result) ? { type: 'toast', name: 'angry ok' } : { type: 'toast', name: 'angry done' };
        break;
    }

    res.response = response;
    next();
  }

  getUserInfo = async (req, res, next) => {
    var cwjy = { action: "UserInfo", userId: req.params.user };
    var result = await connDBServer.sendAndReceive(cwjy);
    res.response = { responseCode: { type: 'page', name: 'user status' }, result: result};
    next();
  }

  getUserStatus = async (req, res, next) => {

    var cwjy = { action: "UserStatus", userId: req.params.user };
    var result = await connDBServer.sendAndReceive(cwjy);
    var r2;
    
    for (var i in result) {
      if(result[i].status == 'Charging') {
        cwjy = { action: 'ChargingStatus', userId: req.params.user };
        r2 = await connDBServer.sendAndReceive(cwjy);
        result[i].chargingStatus = r2[0].bulkSoc;
      }
    }
    res.response = { responseCode: { type: 'page', name: 'user status' }, result: result};
    next();
  }

  getUserChargingStatus = async (req, res, next) => {
    waitingJobs++;
    var cwjy = { action: "ChargingStatus", userId: req.params.user};
    var result = await connDBServer.sendAndReceive(cwjy);
    var remaining, elapsed, avgKW, capa;

    elapsed = Math.floor((new Date(Date.now()) - new Date(result[0].started)) / 1000);
    result[0].elapsed = Math.floor(elapsed / 3600) + ":" + Math.floor((elapsed % 3600) / 60) + ":" + elapsed % 60;

    result[0].price = Math.ceil((result[0].priceHCL + result[0].priceHost) * (result[0].meterNow - result[0].meterStart));
    avgKW = (result[0].meterNow - result[0].meterStart) / elapsed * 3600;

    /*
    if (result[0].meterNow - result[0].meterStart > 5) {
      capa = (result[0].meterNow - result[0].meterStart) / (result[0].currentSoc - result[0].bulkSoc) * 100;
    }
    */
    result[0].avgKW = Math.round(avgKW * 100) / 100;

    if (result[0].fullSoc == 0) {
      result[0].currentSoc = result[0].bulkSoc;
      result[0].remaining = 0;
      result[0].estCost = 0;
    }
    else {
      result[0].currentSoc = Math.round(result[0].bulkSoc + (result[0].meterNow - result[0].meterStart) / capa);
      //remaining = (result[0].fullSoc - result[0].currentSoc) / avgKW;
      result[0].remaining = Math.floor(remaining) + ':' + Math.floor(((remaining - Math.floor(remaining)) * 60));
      result[0].estCost = Math.ceil(remaining * (result[0].priceHCL + result[0].priceHost));
    }

    cwjy = { action: 'EVSEStatus', evseSerial: result[0].evseSerial };
    var r2 = await connDBServer.sendAndReceive(cwjy);


    res.response = { responseCode: { type: 'page', name: 'charging status' }, status: r2[0].status, result: result};
    next();
  }

  getUserChargingHistory = async (req, res, next) => {
    waitingJobs++;
    var cwjy = { action: "UserHistory", userId: req.params.user};
    var result = await connDBServer.sendAndReceive(cwjy);
    res.response = (!result) ? { responseCode: { type: 'error', name: 'wrong parameters' }, result: []}
                             : { responseCode: { type: 'page', name: 'user history' }, result: result };

    next();
  }

  getUserRecent = async (req, res, next) => {
    waitingJobs++;
    var cwjy = { action: "GetUserFavo", userId: req.params.user, favo: 'recent'};
    var result = await connDBServer.sendAndReceive(cwjy);
    res.response = (!result) ? { responseCode: { type: 'page', name: 'no records' }, result: [] }
                             : { responseCode: { type: 'page', name: 'recently visited' }, result: result };
    next();
  }
  getUserFavo = async (req, res, next) => {
    waitingJobs++;
    var cwjy = { action: "GetUserFavo", userId: req.params.user, favo: 'favorite'};
    var result = await connDBServer.sendAndReceive(cwjy);
    res.response = (!result) ? { responseCode: { type: 'page', name: 'no records' }, result: [] }
                             : { responseCode: { type: 'page', name: 'user favorite' }, result: result };

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

    res.response = (!result) ? { responseCode: { type: 'popup', name: 'already done' }, result: [] }
                             : { responseCode: { type: 'popup', name: 'add ok' }, result: [] };
    next();
  }

  delUserFavo = (req, res, next) => {
    var cwjy = { action: "DelUserFavo", userId: req.body.user, chargePointId: req.body.cp, favo: 'favorite'};
    connDBServer.sendOnly(cwjy);
    res.response = { responseCode: { type: 'popup', name: 'delete ok' }, result: [] };
    next();
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
    var evses = await connDBServer.sendAndReceive(cwjy);
    var cp = await connDBServer.sendAndReceive({ action: 'GetCPDetail', chargePointId: req.params.cp});
    var yn = await connDBServer.sendAndReceive({ action: 'IsFavorite', chargePointId: req.params.cp, userId: req.params.user});
    res.response = (yn[0].cnt > 0) ? { responseCode: { type: 'page', name: 'cp info' }, chargePoint: cp, result: evses, favorite: 'yes' }
                        : { responseCode: { type: 'page', name: 'cp info' }, chargePoint: cp, result: evses, favorite: 'no' };

    next();
  }

  getChargePointList = async (req, res, next) => {
    if (req.query.lat && req.query.lng && req.query.rng) {
      cwjy = { action: 'ShowAllCPbyLoc', lat: req.query.lat, lng: req.query.lng, rng: req.query.rng };
    }
    else if(req.query.name) {
      cwjy = { action: 'ShowAllCPbyName', name: req.query.name};
    }
    else {
      res.response = { responseCode: { type: 'error', name: 'wrong parameters' }, result: result };
      next();
      return;
    }
    var result = await connDBServer.sendAndReceive(cwjy);
    res.response = { responseCode: { type: 'page', name: 'cp list' }, result: result};
    next();

  }

  postDamageReport = (req, res, next) => {
    // evse nickname
    //////////////////////////////////////////////
    // images, writings
    /*
    cwjy = { action: 'Report', evseSerial: req.params.evse };
    result = connDBServer.sendOnly(cwjy);
    */
   
    fs.renameSync(req.file.path, './uploads/' + req.file.originalname);
    console.log(JSON.stringify(req.file));

    res.response = { responseCode: { type: 'popup', name: 'ok'}, result: [] };
    next();
  }

  evseBoot = async (req, origin) => {
    req.evseSerial = origin;
    var conf = { messageType: 3, uuid: req.uuid, pdu: {} };
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
    var conf = { messageType: 3, uuid: req.uuid, pdu: {} };
    switch (req.action) {
      case 'Heartbeat':
      case 'MeterValues':
      case 'Authorize':
      case 'StartTransaction':
      case 'StopTransaction':
      case 'StatusNotification':
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
  evseResponse = async (req, origin) => {
    req.evseSerial = origin;
    switch (req.action) {
      case 'ChangeAvailability':
      case 'ChangeConfiguration':
      case 'ClearCache':
      case 'DataTransfer':
      case 'GetConfiguration':
      case 'Reset':
      case 'UnlockConnector':
        break;
    }
    // RemoteStartTransaction and RemoteStopTransaction are handled in other functions
  }

  csmsListCP = async (req, res, next) => {
    if (!req.query.userId) {
      res.response = { responseCode: { type: 'error', name: 'user ID is needed' }, result: []};
      next();
      return;
    }
    var cwjy, result;

    cwjy = { action: 'cpList', ownerId: req.query.userId };
    var cpinfo = await connDBServer2.sendAndReceive(cwjy);

    result = {chargepoint: cpinfo };
    res.response = { responseCode: { type: 'page', name: 'cp list' }, result: result};
    next();
      
  }
  csmsListEVSE = async (req, res, next) => {
    if (!req.query.cp) {
      res.response = { responseCode: { type: 'error', name: 'chargepoint ID is needed' }, result: []};
      next();
      return;
    }

    var cwjy = { action: 'ShowAllEVSE', chargePointId: req.query.cp };
    var result = await connDBServer2.sendAndReceive(cwjy);
    res.response = { responseCode: { type: 'page', name: 'EVSE list' }, result: result};
    next();
  }

  csmsHistoryCP = async (req, res, next) => {
    if (!req.query.cp) {
      res.response = { responseCode: { type: 'error', name: 'chargepoint ID is needed' }, result: []};
      next();
      return;
    }

    var cwjy = { action: 'cpHistory', chargePointId: req.query.cp, startDate: req.query.startDate, endDate: req.query.endDate };
    var result = await connDBServer2.sendAndReceive(cwjy);
    res.response = { responseCode: { type: 'page', name: 'CP Charging History'}, result: result};
    next();

  }
  csmsHistoryEVSE = async (req, res, next) => {
    if (!req.query.evseSerial) {
      res.response = { responseCode: { type: 'error', name: 'EVSE Serial is needed' }, result: []};
      next();
      return;
    }
    var cwjy = { action: 'EVSEHistory', evseSerial: req.query.evseSerial, startDate: req.query.startDate, endDate: req.query.endDate };
    var result = await connDBServer2.sendAndReceive(cwjy);
    res.response = { responseCode: { type: 'page', name: 'EVSE Charging History'}, result: result};
    next();
  }

  // query: type='bytime' or 'bymonth', duration= date default 365, cp = cpid
  
  csmsReportCP = async (req, res, next) => {

    var cwjy = { action: 'cpHistory', chargePointId: req.query.cp, startDate: req.query.startDate, endDate: req.query.endDate };
    var result = await connDBServer2.sendAndReceive(cwjy);
    var returnValue = [{ cost: 0, kWh: 0 }, { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 },
                       { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 },
                       { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 }];
    switch (req.query.type) {
      case 'bytime':
        for (var i in result) {
          returnValue[Math.floor(Number(result[i].time) / 2)].cost += result[i].cost;
          returnValue[Math.floor(Number(result[i].time) / 2)].kWh += result[i].totalkWh;
        }
        res.response = { responseCode: { type: 'page', name: 'report by time', result: returnValue } }
        break;
      case 'bymonth':
        for (var i in result) {
          returnValue[Number(result[i].month)].cost += result[i].cost;
          returnValue[Number(result[i].month)].kWh += result[i].totalkWh;
        }
        res.response = { responseCode: { type: 'page', name: 'report by month', result: returnValue } }
        break;
    }
    console.log(returnValue);
    next();
  }
  csmsReportUser = async (req, res, next) => {

    var cwjy = { action: 'UserHistory', user: req.query.user, startDate: req.query.startDate, endDate: req.query.endDate };
    var result = await connDBServer2.sendAndReceive(cwjy);
    var returnValue = [{ cost: 0, kWh: 0 }, { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 },
                       { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 },
                       { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 }, { cost: 0, kWh: 0 }];
    switch (req.query.type) {
      case 'bytime':
        for (var i in result) {
          returnValue[Math.floor(Number(result[i].time) / 2)].cost += result[i].cost;
          returnValue[Math.floor(Number(result[i].time) / 2)].kWh += result[i].totalkWh;
        }
        res.response = { responseCode: { type: 'page', name: 'report by time', result: returnValue } }
        break;
      case 'bymonth':
        for (var i in result) {
          returnValue[Number(result[i].month)].cost += result[i].cost;
          returnValue[Number(result[i].month)].kWh += result[i].totalkWh;
        }
        res.response = { responseCode: { type: 'page', name: 'report by month', result: returnValue } }
        break;
    }
    console.log(returnValue);
    next();
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
    waitAndGo,        // semaphore
    hScan,            // scan and charge, stop charging, wait alarm, send angry, 
    hAction,
    getUserInfo,
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
    evseBoot,         // handling BootNotification only
    evseRequest,      // handling every other resquests
    evseResponse,     // handling responses
    csmsListCP,
    csmsListEVSE,
    csmsHistoryCP,
    csmsHistoryEVSE,
    csmsReportCP,
    csmsReportUser,
    writeResponse
  }

  connCP.enlistForwarding('boot', evseBoot);
  connCP.enlistForwarding('request', evseRequest);
  connCP.enlistForwarding('response', evseResponse);
  consoleCommand();

  return apiController;
}

module.exports = APIController;