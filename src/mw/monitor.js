var constants = require('../lib/constants');
var admin = require('firebase-admin');
var serviceAccount = require('../../hclabfcm-firebase-adminsdk-bjdsm-1eeb19cb09.json');

function DBMonitor(dbms) {
  var dbConnector = require('../lib/dbConnector')(dbms);
  dbConnector.setLog('no');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  async function watch() {
    //console.log('monitor started');
    var query, result, r2, values, msg;

    query = `SELECT chargePointId FROM chargepoint`;
    result = await dbConnector.submitSync(query);
    for (var i in result) {
      query = `SELECT COUNT(*) AS cnt FROM evse
               WHERE chargePointId = ? AND status = 'Available'`;
      values = [result[i].chargePointId];
      r2 = await dbConnector.submitSync(query, values);
      query = `UPDATE chargepoint SET avails = ? WHERE chargePointId = ?`;
      values = [r2[0].cnt, result[i].chargePointId];
      dbConnector.submitSync(query, values);
    }
    
    query = `SELECT occupyingUserId, evseSerial FROM evse WHERE occupyingEnd < CURRENT_TIMESTAMP AND status='Reserved'`;
    result = await dbConnector.submitSync(query, []);
    for (var i in result) {
      query = `UPDATE evse SET occupyingUserId = NULL, occupyingEnd = NULL, status = 'Available' 
                WHERE evseSerial = ?`;
      values = [result[i].evseSerial];
      dbConnector.submit(query, values);
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
               pdu: {status: 'Unavailable', timestamp: Math.floor(Date.now()/1000)}};
      //console.log(`watch: ${JSON.stringify(result[i])} is now unavailable`);
      //toDBsvr(cwjy);
    }
    */

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
      query = `UPDATE notification SET expiry = FROM_UNIXTIME(${Math.floor(Date.now()/1000)}) + ${expiryAfter} 
               WHERE recipientId = '${result[i].recipientId}' AND evseSerial = '${result[i].evseSerial}' AND expiry IS NULL`;
      dbConnector.submit(query);
      msg = { data: { title: 'test title', body: 'body body', }, token: result[0].endPoint, };
      sendPushNotification(msg);
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

  };

  // currently not used. connect to dbms directly from here via dbConnector
  function registerSender(sendingFunction) {
    console.log('registerSender: assigned');
    toDBsvr = sendingFunction;
  };

  function sendPushNotification (message) {
    admin.messaging()
         .send(message)
         .then((response) => {
          console.log(`${new Date().toLocaleString()} push sent: ${JSON.stringify(response)}`);
         })
         .catch((err) => {
          console.log(`${new Date().toLocaleString()} push error: ${err}`);
         });
  };

  const dbMonitor = {
    watch,
    registerSender
  }
  return dbMonitor;
}

module.exports = DBMonitor;