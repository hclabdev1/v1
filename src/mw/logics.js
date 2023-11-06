var constants = require('../lib/constants');
var dbSpeedAvg = 0, trxCount =0, requestCount = 0;

function DBController (dbms) {
  const dbConnector = require('../lib/dbConnector')(dbms);
  dbConnector.setLog('no');  

  preProcess = (event, cwjy, callback) => {
  }

  showPerformance = () => {
    console.log(`dbServer:: total transactions: ${requestCount}, average processing time(ms): ${dbSpeedAvg}`);
  }

  // Charging Station Management System API handling
  csmsRequest = async (cwjy, callback) => {
    console.log(new Date().toLocaleString() + ':: CSMS Req :: ' + JSON.stringify(cwjy));
    var query, values, returnValue;
    switch (cwjy.action) {
      case 'cpList':
        query = `SELECT chargePointId, chargePointName, lat, lng, locationDetail, address, priceHCL, priceHost, priceExtra, evses, avails
                 FROM chargepoint WHERE ownerId = ?`;
        values = [cwjy.ownerId];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'UserHistory':
        query = `SELECT userId FROM user WHERE email = ?`;
        values = [cwjy.user];
        var user = await dbConnector.submitSync(query, values);
        if(!user) {
          break;
        }

        query = `SELECT DATE_FORMAT(finished, '%Y-%m-%d %H:%i:%s') AS finished, 
                        DATE_FORMAT(finished, '%m') AS month,
                        DATE_FORMAT(finished, '%H') AS time,
                        totalkWh, cost, evseSerial, evseNickname
                 FROM viewbillplus 
                 WHERE userId = ? AND finished >= ? AND finished <= ?`;
        //var date = new Date(Date.now() - cwjy.date * 24 * 60 * 60 * 1000).toISOString().substring(0,10);
        values = [user[0].userId, cwjy.startDate, cwjy.endDate];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'cpHistory':
        query = `SELECT DATE_FORMAT(finished, '%Y-%m-%d %H:%i:%s') AS finished, 
                        DATE_FORMAT(finished, '%m') AS month,
                        DATE_FORMAT(finished, '%H') AS time,
                        totalkWh, cost, evseSerial, evseNickname
                 FROM viewbillplus 
                 WHERE chargePointId = ? AND finished >= ? AND finished <= ?`;
        //var date = new Date(Date.now() - cwjy.date * 24 * 60 * 60 * 1000).toISOString().substring(0,10);
        values = [cwjy.chargePointId, cwjy.startDate, cwjy.endDate];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'EVSEHistory':
        query = `SELECT DATE_FORMAT(finished, '%Y-%m-%d %H:%i:%s') AS finished, totalkWh, cost, evseSerial, evseNickname
                 FROM viewbillplus 
                 WHERE evseSerial = ? AND finished >= ? AND finished <= ?`;
        //var date = new Date(Date.now() - cwjy.date * 24 * 60 * 60 * 1000).toISOString().substring(0,10);
        values = [cwjy.evseSerial, cwjy.startDate, cwjy.endDate];
        returnValue = await dbConnector.submitSync(query, values);
        break;
    }
    if(callback)
      callback(returnValue);
  }

  // Authorization requests handling
  authRequest = async (cwjy, callback) => {
    console.log(new Date().toLocaleString() + ':: Auth Req :: ' + JSON.stringify(cwjy));
    var returnValue, query, values, result;
    switch (cwjy.action) {
      case 'AuthStatus':
        query = `SELECT userId, authStatus FROM user WHERE email = ?`;
        values = [cwjy.email];
        result = await dbConnector.submitSync(query, values);
        returnValue = result;
        break;
      case 'SignUp':
        query = `UPDATE user SET password=SHA2(?, 256) WHERE email = ?`;
        values = [cwjy.password, cwjy.email];
        result = await dbConnector.submitSync(query, values);
        returnValue = result;
        break;
      case 'Login':
        query = `SELECT userId FROM user WHERE email = ? AND password = SHA2(?, 256)`;
        values = [cwjy.email, cwjy.password];
        result = await dbConnector.submitSync(query, values);
        returnValue = result;
        break;
      case 'PostLogin':
        query = `UPDATE user SET endPoint = ? WHERE email = ?`;
        values = [cwjy.fcmToken, cwjy.email];
        dbConnector.submit(query, values);
        break;
      case 'GetID':
        query = `SELECT userId FROM user WHERE email = ?`;
        values = [cwjy.email];
        result = await dbConnector.submitSync(query, values);
        returnValue = result;
        break;
      case 'EmailAuth':
        query = `INSERT INTO user (email, created, authStatus)
                  VALUES ( ?, CURRENT_TIMESTAMP, 'Accepted')`;
        values = [cwjy.email];
        dbConnector.submit(query, values);
        break;
      case 'RegisterPhone':
        query = `UPDATE user SET phone = ? WHERE email = ?`;
        values = [cwjy.phone, cwjy.email];
        dbConnector.submit(query, values);
        break;
      case 'CarInfo':
        query = 'SELECT battery FROM spec WHERE weight = ? AND cmpnd = ?';
        values = [cwjy.weight, cwjy.cmpnd];
        //query = 'SELECT battery FROM spec WHERE cmpnd = ? AND frwy = ? AND dwtw = ?';
        //values = [cwjy.cmpnd, cwjy.frwy, cwjy.dwtw];
        result = await dbConnector.submitSync(query, values);
        if(result) {
          query = 'UPDATE user SET fullSoc = ? WHERE email = ?';
          values = [result[0].battery, cwjy.email];
          dbConnector.submit(query, values);
        }
        else {
          //console.log('no battery information with this spec' + cwjy.name + cwjy.weight);
          console.log('no battery information with this spec: ' + JSON.stringify(cwjy));
        }

        // for PoC only. temporary data creation
        query = `SELECT userId FROM user WHERE email = ?`;
        values = [cwjy.email];
        var user = await dbConnector.submitSync(query, values);
        /*
        for( var i = 0; i < 20; i++) {
          query = `INSERT INTO bill (started, finished, chargePointId, evseSerial, evseNickname, ownerId, userId, totalkWh, cost)
                   SELECT started, finished, chargePointId, evseSerial, evseNickname, ownerId, ?, totalkWh, cost
                   FROM bill WHERE trxId = ?`;
          values = [user[0].userId, i * 2];
          dbConnector.submit(query, values);
        }
        */
        break;
    }

    if(callback)
      callback(returnValue);
  }

  // App, OCPP requests handling
  extRequest = async (cwjy, callback) => {
    requestCount++;
    var returnValue, query, result, values;
    console.log(new Date().toLocaleString() + ':: ext Req :: ' + JSON.stringify(cwjy));
    switch (cwjy.action) {
      case 'GetSerial':         // return evseSerial with evseNickname    for App requests
        query = `SELECT evseSerial FROM evse WHERE evseNickname = ?`;
        values = [cwjy.evseNickname];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'EVSEStatus':
        query = `SELECT status FROM evse WHERE evseSerial = ?`;
        values = [cwjy.evseSerial];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'EVSECheck':
        query = `SELECT evseSerial, status, occupyingUserId FROM evse WHERE evseNickname = ?`;
        values = [cwjy.evseNickname];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'UserInfo':
        query = `SELECT phone, email, authStatus, cardNumber FROM user WHERE userId = ?`;
        values = [cwjy.userId];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'UserStatus':
        query = `SELECT evseNickname, status, occupyingUserId, 
                        DATE_FORMAT(occupyingEnd, '%Y-%m-%d %H:%i:%s') AS occupyingEnd, connectorId
                  FROM evse
                  WHERE occupyingUserId = ?`;
        values = [cwjy.userId];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'GetCapa':
        query = `SELECT capacity FROM evse WHERE evseSerial = ?`;
        values = [cwjy.evseSerial];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'ChargingStatus':
        query = `SELECT DATE_FORMAT(started, '%Y-%m-%d %H:%i:%s') AS started,
                        DATE_FORMAT(finished, '%Y-%m-%d %H:%i:%s') AS finished,
                        chargePointName, bulkSoc, fullSoc, meterStart, meterNow, totalkWh, priceHCL, priceHost,
                        evseSerial, evseNickname, trxId
                  FROM viewbillplus 
                   WHERE userId = ? ORDER BY trxId DESC LIMIT 1`;
        values = [cwjy.userId];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'Reserve':
        query = `UPDATE evse SET status = 'Reserved', occupyingUserId = ?, occupyingEnd = DATE_ADD(NOW(), INTERVAL ? MINUTE)
                  WHERE evseSerial = ?`;
        values = [cwjy.userId, constants.SQL_RESERVE_DURATION, cwjy.evseSerial];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'Angry':
        query = `SELECT occupyingUserId FROM evse WHERE evseSerial = ?`;
        values = [cwjy.evseSerial];
        var target = await dbConnector.submitSync(query, values);
        query = `SELECT * FROM notification WHERE recipientId = ?`;
        values = [target[0].occupyingUserId];   // actually, don't need this cuz the values are from DB
        result = await dbConnector.submitSync(query, values);
        query = (!result) ? `INSERT INTO notification (evseSerial, recipientId, type)
                              VALUES (?, ?, 'Angry')`
                          : null;
        values = [cwjy.evseSerial, target[0].occupyingUserId];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'Alarm':
        query = `INSERT INTO notification (evseSerial, recipientId, type) VALUES (?, ?, 'Waiting')`;
        values = [cwjy.evseSerial, cwjy.userId];
        dbConnector.submit(query, values);
        break;
      case 'Report':
        break;
      case 'ShowAllEVSE':
        query = `SELECT chargePointId, chargePointName, address, priceHCL, priceHost, priceExtra,
                        evseSerial, evseNickname, status, occupyingUserId, 
                        DATE_FORMAT(occupyingEnd, '%Y-%m-%d %H:%i:%s') AS occupyingEnd, capacity, connectorId
                 FROM evsebycp 
                 WHERE chargePointId = ?`;
        values = [cwjy.chargePointId];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'ShowAllCPbyLoc':
        var box = getBox(cwjy.lat, cwjy.lng, cwjy.rng);
        query = `SELECT chargePointId, chargePointName, ownerId, lat, lng, locationDetail,
                        address, priceHCL, priceHost, priceExtra, evses, avails
                  FROM chargepoint 
                  WHERE lat < '${box.top}' AND lat > '${box.bottom}'
                  AND lng < '${box.right}' AND lng > '${box.left}'`;
        returnValue = await dbConnector.submitSync(query);
        break;
      case 'ShowAllCPbyName':
        query = `SELECT chargePointId, chargePointName, ownerId, lat, lng, locationDetail,
                        address, priceHCL, priceHost, priceExtra, evses, avails
                  FROM chargepoint 
                  WHERE chargePointName LIKE ?`;
        values = [`%${cwjy.name}%`];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'UserHistory':
        query = `SELECT DATE_FORMAT(started, '%Y-%m-%d %H:%i:%s') AS started,
                        DATE_FORMAT(finished, '%Y-%m-%d %H:%i:%s') AS finished,
                        chargePointName, evseNickname, totalkWh, cost 
                 FROM viewbillplus 
                 WHERE userId = ? ORDER BY trxId DESC`;
        values = [cwjy.userId];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'BootNotification':                                    
        query = `SELECT evseSerial, heartbeat 
                 FROM evse JOIN chargepoint 
                 ON evse.chargePointId = chargepoint.chargePointId AND evse.evseSerial = ?
                 WHERE chargepoint.vendor = ? AND chargepoint.model = ?`;
        var now = Math.floor(Date.now() / 1000);
        var nowstr = now.toString();
        values = [cwjy.evseSerial, cwjy.pdu.chargePointVendor, cwjy.pdu.chargePointModel];
        result = await dbConnector.submitSync(query, values);
        if (!result)
          returnValue = { currentTime: nowstr, interval: 0, status: 'Rejected' };
        else {
          returnValue = { currentTime: nowstr, interval: result[0].heartbeat, status: 'Accepted' };
          query = `UPDATE evse SET booted = FROM_UNIXTIME(?), lastHeartbeat = FROM_UNIXTIME(?),
                                   status = 'Available', occupyinguserid = NULL, occupyingEnd = NULL
                   WHERE evseSerial = ?`;
          values = [now, now, cwjy.evseSerial];
          dbConnector.submit(query, values);
        }
        break;
      case 'Authorize':                                           
        query = `SELECT authStatus FROM user WHERE cardNumber = ?`;
        values = [cwjy.pdu.idTag];
        result = await dbConnector.submitSync(query, values);
        returnValue = (!result) ? { idTagInfo: { status: 'Invalid' } } 
                                : { idTagInfo: { status: result[0].authStatus } };
        break;
      case 'Heartbeat':                                           
        query = `UPDATE evse SET lastHeartbeat = CURRENT_TIMESTAMP WHERE evseSerial = ?`;
        values = [cwjy.evseSerial];
        dbConnector.submit(query, values);
        var nowstr = Math.floor(Date.now() / 1000).toString();
        returnValue = { currentTime: nowstr};
        break;
      case 'MeterValues':
        var kWh, ckWh, A, V, t, time, kw;
        for (var i in cwjy.pdu.meterValue) {
          kWh = cwjy.pdu.meterValue[i].sampledValue[0].value;
          ckWh = cwjy.pdu.meterValue[i].sampledValue[1].value;
          A = cwjy.pdu.meterValue[i].sampledValue[2].value;
          V = cwjy.pdu.meterValue[i].sampledValue[3].value;
          t = cwjy.pdu.meterValue[i].sampledValue[4].value;
          time = cwjy.pdu.meterValue[i].timestamp;
          kw = Math.floor(A * V / 1000);
          query = `SELECT meterStart FROM bill WHERE trxId = ?`;
          values = [cwjy.pdu.transactionId];
          result = await dbConnector.submitSync(query, values);
          if(!result) {
            returnValue = {};
            break;
          }
          if (result[0].meterStart == 0) {
            query = `UPDATE evse SET lastHeartbeat = FROM_UNIXTIME(?) WHERE evseSerial = ?;
                    UPDATE bill SET meterNow = ? WHERE trxId = ?;
                    UPDATE bill SET totalkWh = totalkWh + ? WHERE trxId = ?;
                    INSERT INTO evselogs (evseSerial, time, temp, V, A, kWh, tkWh)
                    VALUES (?, FROM_UNIXTIME(?), ?, ?, ?, ?, ?); `;
            values = [time, cwjy.evseSerial, kWh, cwjy.pdu.transactionId, ckWh, cwjy.pdu.transactionId, 
                      cwjy.evseSerial, time, t, V, A, kWh, ckWh];
          }
          else {
            query = `UPDATE evse SET lastHeartbeat = FROM_UNIXTIME(?) WHERE evseSerial = ?;
                    UPDATE bill SET meterNow = ? WHERE trxId = ?;
                    UPDATE bill SET totalkWh = meterNow - meterStart WHERE trxId = ?;
                    INSERT INTO evselogs (evseSerial, time, temp, V, A, kWh, tkWh)
                    VALUES (?, FROM_UNIXTIME(?), ?, ?, ?, ?, ?); `;
            values = [time, cwjy.evseSerial, kWh, cwjy.pdu.transactionId, cwjy.pdu.transactionId, 
                      cwjy.evseSerial, time, t, V, A, kWh, ckWh];
          }
          result = await dbConnector.submitSync(query, values);
        }
        returnValue = {};
        break;
      case 'StartTransaction':
        
        query = `SELECT MAX(trxId) AS max FROM bill;`;
        result = await dbConnector.submitSync(query);
        cwjy.pdu.transactionId = result[0].max + 1;
        
        query = `SELECT userId FROM user WHERE cardNumber = ?`;
        values = [cwjy.pdu.idTag];
        result = await dbConnector.submitSync(query, values);

        var userId = result ? result[0].userId : cwjy.pdu.idTag;
        var meterStart = cwjy.pdu.meterStart / 1000;

        query = 'SELECT fullSoc FROM user WHERE userId = ?';
        values = [userId];
        result = await dbConnector.submitSync(query, values);
        var fullSoc = result[0].fullSoc;

        query = `UPDATE evse SET status = 'Charging', occupyingUserId = ? WHERE evseSerial = ?`;
        values = [userId, cwjy.evseSerial];
        result = await dbConnector.submitSync(query, values);
        query = `INSERT INTO bill (started, evseSerial, userId, bulkSoc, fullSoc, meterStart, meterNow, trxId)
                  VALUES (FROM_UNIXTIME(?), ?, ?, ?, ?, ?, ?, ?)`;
        values = [cwjy.pdu.timestamp, cwjy.evseSerial, userId, cwjy.pdu.ressoc, fullSoc, meterStart, meterStart, cwjy.pdu.transactionId];
        result = await dbConnector.submitSync(query, values);
        query = `UPDATE bill b INNER JOIN evse e ON b.evseSerial = e.evseSerial
                  SET b.chargePointId = e.chargePointId, b.evseNickname = e.evseNickname, b.ownerId = e.ownerId
                  WHERE b.trxId = ?`;
        values = [cwjy.pdu.transactionId];
        dbConnector.submit(query, values);
        returnValue = { transactionId: cwjy.pdu.transactionId, idTagInfo: { status: 'Accepted' } };
        break;
      case 'StopTransaction':
        query = `SELECT meterStart, priceHCL, priceHost FROM viewbillplus WHERE trxId = ?`;
        values = [cwjy.pdu.transactionId];
        result = await dbConnector.submitSync(query, values);
        if(!result) {
          console.warn('no transaction ongoing.');
          query = '';
          break;
        }
        var meterStop = Number(cwjy.pdu.meterStop) / 1000;
        var totalkWh = meterStop - Number(result[0].meterStart);
        var costhcl = totalkWh * Number(result[0].priceHCL);
        var costhost = totalkWh * Number(result[0].priceHost);
        var costTotal = costhcl + costhost;
        if (result[0].meterStart == 0) {
          query = `UPDATE evse SET status = 'Finishing' WHERE evseSerial = ?;
                   UPDATE bill SET finished = FROM_UNIXTIME(?), cost = ?, costHCL = ?, costHost= ?, termination = ?, meterNow = ?
                   WHERE trxId = ?;`;
          values = [cwjy.evseSerial, cwjy.pdu.timestamp, costTotal, costhcl, costhost, 
                    cwjy.pdu.reason, meterStop, cwjy.pdu.transactionId];
        }
        else {
        query = `UPDATE evse SET status = 'Finishing' WHERE evseSerial = ?;
                 UPDATE bill SET finished = FROM_UNIXTIME(?), cost = ?, costHCL = ?, costHost= ?, 
                                 termination = ?, meterNow = ?, totalkWh = ?
                  WHERE trxId = ?;`;
          values = [cwjy.evseSerial, cwjy.pdu.timestamp, costTotal, costhcl, costhost, 
                    cwjy.pdu.reason, meterStop, totalkWh, cwjy.pdu.transactionId];
        }
        dbConnector.submit(query, values);

        query = `INSERT INTO notification (evseSerial, recipientId, type) VALUES (?, ?, 'Finishing')`;
        values = [cwjy.evseSerial, cwjy.userId];
        dbConnector.submit(query, values);
        returnValue = {};
        break;
      case 'StatusNotification':
        if(cwjy.pdu.errorCode == 'NoError') {
          query = `UPDATE evse SET status = ? WHERE evseSerial = ?`;
          values = [cwjy.pdu.status, cwjy.evseSerial];
        }
        else if (cwjy.pdu.status == 'Available') {
          query = `UPDATE evse SET status = ?, occupyingUserId = NULL WHERE evseSerial = ?`;
          values = [cwjy.pdu.status, cwjy.evseSerial];
        }
        else {
          query = `INSERT INTO issues (evseSerial, time, errorCode) VALUES (?, FROM_UNIXTIME(?), ?)`;
          values = [cwjy.pdu.status, cwjy.evseSerial, cwjy.evseSerial, cwjy.pdu.timestamp, cwjy.pdu.errorCode];
        }
        dbConnector.submit(query, values);
        returnValue = {};
        break;
      case 'GetCPDetail':
        query = `SELECT chargePointName, chargePointId,  address, locationDetail, lat, lng,
                        priceHCL, priceHost, priceExtra, parkingCondition, evses, avails
                 FROM chargepoint
                 WHERE chargePointId = ?`;
        values = [cwjy.chargePointId];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'IsFavorite':
        query = `SELECT COUNT(*) AS cnt FROM favorite
                 WHERE userId = ? AND chargePointId = ? AND favoriteOrder > 0`;
        values = [cwjy.userId, cwjy.chargePointId];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'GetUserFavo':
        query = (cwjy.favo == 'favorite') ? `SELECT c.chargePointName AS chargePointName, f.chargePointId AS chargePointId,
                                                    f.favoriteOrder AS favoriteOrder, c.priceHCL AS priceHCL,
                                                    c.priceHost AS priceHost, c.priceExtra AS priceExtra,
                                                    c.parkingCondition AS parkingCondition, c.avails AS avails
                                              FROM favorite f JOIN chargepoint c ON f.chargePointId = c.chargePointId
                                              WHERE userId = ?
                                              AND favoriteOrder IS NOT NULL ORDER BY favoriteOrder`
                                          : `SELECT c.chargePointName AS chargePointName, f.chargePointId AS chargePointId,
                                                    f.favoriteOrder AS favoriteOrder, c.priceHCL AS priceHCL,
                                                    c.priceHost AS priceHost, c.priceExtra AS priceExtra,
                                                    c.parkingCondition AS parkingCondition,
                                              DATE_FORMAT(recent, '%Y-%m-%d %H:%i:%s') as recent, c.avails AS avails
                                              FROM favorite f JOIN chargepoint c ON f.chargePointId = c.chargePointId
                                              WHERE userId = ?
                                              AND recent IS NOT NULL ORDER BY recent DESC`;
        values = [cwjy.userId];
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'NewUserFavo':
        if(cwjy.favo == 'favorite') {
          query = `SELECT MAX(favoriteOrder) AS max FROM favorite WHERE userId = ?`;
          values = [cwjy.userId];
          result = await dbConnector.submitSync(query, values);
          var order = result ? result[0].max + 1 : 1;
          query = `INSERT INTO favorite (userId, chargePointId, favoriteOrder) VALUES (?, ?, ?)`;
          values = [cwjy.userId, cwjy.chargePointId, order];
        }
        else if(cwjy.favo == 'recent') {
          query = `SELECT chargePointId AS cpid FROM evse WHERE evseNickname = ?`;
          values = [cwjy.evse];
          result = await dbConnector.submitSync(query, values);
          var cpid = result[0].cpid;
          //console.log(`user: ${cwjy.userId} cp: ${cpid}`);
          query = `SELECT * FROM favorite WHERE userId = ? AND chargePointId = ? AND favoriteOrder = 0`;
          values = [cwjy.userId, cpid];
          result = await dbConnector.submitSync(query, values);
          query = (result) ? `UPDATE favorite SET recent = CURRENT_TIMESTAMP
                                  WHERE userId = ? AND chargePointId = ? AND favoriteOrder = 0`
                           : `INSERT INTO favorite (userId, chargePointId, recent, favoriteOrder)
                                  VALUES (?, ?, CURRENT_TIMESTAMP, 0)`;
          values = [cwjy.userId, cpid];
        }
        else {
          query = null;
          break;
        }
        returnValue = await dbConnector.submitSync(query, values);
        break;
      case 'DelUserFavo':
        query = `DELETE FROM favorite WHERE userId=? AND chargePointId=?`;
        values = [cwjy.userId, cwjy.chargePointId];
        dbConnector.submit(query, values);
        break;
      case 'ChangeAvailability':
      case 'ChangeConfiguration':
      case 'ClearCache':
      case 'DataTransfer':
      case 'GetConfiguration':
        break;
      case 'Reset':
        break;

    }

    if(callback)
      callback(returnValue);
  }

  getBox = (lat, lng, rng)  => {
    var latPerKM = ( 1 / (constants.EARTH_RADIUS * 1 * (Math.PI / 180))) / 1000;
    var lngPerKM = ( 1 / (constants.EARTH_RADIUS * 1 * (Math.PI / 180) * Math.cos(lat * Math.PI / 180))) / 1000;

    var box = { top: (parseFloat(lat) + (rng * latPerKM)), 
                bottom: (parseFloat(lat) - (rng * latPerKM)),
                right: (parseFloat(lng) + (rng * lngPerKM)),
                left: (parseFloat(lng) - (rng * lngPerKM)) };
    return box;
  }

  setTxCount = async() => {
    var query = `SELECT MAX(trxId) AS max FROM bill;`;
    var result = await dbConnector.submitSync(query);
    
    trxCount = result[0].max + 1;
    console.debug('setTxCount: ' + trxCount);
  }

  const dbController = {
    preProcess,
    showPerformance,
    extRequest,         // App, OCPP requests handling
    //nnmRequest,         // notification & monitoring server request handling
    authRequest,        // authorization requests handling
    csmsRequest,        // Charging Station Management System API handling
    setTxCount          // counting transactionId
  }

  return dbController;
}

module.exports = DBController;
