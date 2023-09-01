var constants = require('../lib/constants');

function DBMonitor(dbms) {
  var dbConnector = require('../lib/dbConnector')(dbms);
  dbConnector.setLog('no');

  async function watch() {
    //console.log('monitor started');
    var query, result, cwjy, r2;

    query = `SELECT chargePointId FROM chargepoint`;
    result = await dbConnector.submitSync(query);
    for (var i in result) {
      query = `SELECT COUNT(*) AS cnt FROM evse
               WHERE chargePointId = '${result[i].chargePointId}' AND status = 'Available'`;
      r2 = await dbConnector.submitSync(query);
      query = `UPDATE chargepoint SET avails = ${r2[0].cnt} WHERE chargePointId = '${result[i].chargePointId}'`;
      dbConnector.submitSync(query);
    }
    
    query = `SELECT occupyingUserId, evseSerial FROM evse WHERE occupyingEnd < CURRENT_TIMESTAMP AND status='Reserved'`;
    result = await dbConnector.submitSync(query);
    for (var i in result) {
      query = `UPDATE evse SET occupyingUserId = NULL, occupyingEnd = NULL, status = 'Available' 
                WHERE evseSerial = '${result[i].evseSerial}'`;
      dbConnector.submit(query);
    }

    //////////////////////////////////////////
    // heartbeat
    /*
    query = `SELECT evseSerial, lastHeartbeat FROM evse 
             WHERE lastHeartBeat < DATE_SUB(NOW(), INTERVAL ${constants.SQL_HEARTBEAT_LIMIT} MINUTE` ;
    result = await dbConnector.submitSync(query);
    for (var i in result) {
      // status change to faulted?
      cwjy =  {action: 'StatusNotification', evseSerial: result[i].evseSerial,
               pdu: {status: 'Unavailable', timeStamp: Date.now()}};
      //console.log(`watch: ${JSON.stringify(result[i])} is now unavailable`);
      //toDBsvr(cwjy);
    }

    //////////////////////////////////////////
    // notification all

    query = `SELECT * FROM notification WHERE expiry IS NULL`;
    result = await dbConnector.submitSync(query);

    for (var i in result) {
      var expiryAfter;

      switch (result[i].type) {
        case 'Angry':
          expiryAfter = constants.SQL_ANGRY_EXPIRY;
          break;
        case 'Finishing':
          expiryAfter = constants.SQL_FINISHING_EXPIRY;
          break;
        case 'Waiting':
          expiryAfter = constants.SQL_WAITING_EXPIRY;
          break;
      }
      query = `UPDATE notification SET expiry = FROM_UNIXTIME(${Date.now()}) / 1000 + ${expiryAfter} 
               WHERE recipientId = '${result[i].recipientId}' AND evseSerial = '${result[i].evseSerial}' AND expiry IS NULL`;
      //console.log(`${i} : [${JSON.stringify(result[i])}] [${query}]`);
      dbConnector.submit(query);
      // send notification
      // send notification
      // send notification
    };

    query = `SELECT * FROM notification WHERE expiry > CURRENT_TIMESTAMP`;
    result = await dbConnector.submitSync(query);
    for (var i in result) {
      query = `DELETE FROM notification WHERE 
                recipientId = '${result[i].recipientId}' AND expiry = '${result[i].expiry}'`;
      dbConnector.submit(query);
    };
    */

  };

  // currently not used. connect to dbms directly from here via dbConnector
  function registerSender(sendingFunction) {
    console.log('registerSender: assigned');
    toDBsvr = sendingFunction;
  }

  const dbMonitor = {
    watch,
    registerSender
  }
  return dbMonitor;
}

module.exports = DBMonitor;