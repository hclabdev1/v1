var constants = require('../lib/constants');
var admin = require('firebase-admin');
var serviceAccount = require('../../hclabfcm-firebase-adminsdk-bjdsm-2d287a3504.json');
const connDBServer = require('../lib/socketIOWrapper')('nnmServer');

function DBMonitor(dbms) {
  var dbConnector = require('../lib/dbConnector')(dbms);
  dbConnector.setLog('no');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  async function watch() {
    //console.log('monitor started');
    var query, result, r2, values, msg, cwjy;

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
    query = `SELECT evseSerial, lastHeartbeat, status FROM evse 
             WHERE lastHeartBeat < DATE_SUB(NOW(), INTERVAL ${constants.SQL_HEARTBEAT_LIMIT} MINUTE)` ;
    result = await dbConnector.submitSync(query);
    for (var i in result) {
      // status change to faulted?
      query = `UPDATE evse SET status = ? WHERE evseSerial = ?;
               INSERT INTO issues (evseSerial, time, errorCode) VALUES (?, CURRENT_TIMESTAMP, ?);`;
      values = ['Unavailable', result[i].evseSerial, result[i].evseSerial, 'No Heartbeat'];
      dbConnector.submit(query, values);
      //console.log(`watch: ${JSON.stringify(result[i])} is now unavailable`);
      if(result[i].status == 'Charging') {
        query = `SELECT trxid, userId, meterNow FROM bill WHERE evseSerial = '${result[i].evseSerial}' ORDER BY trxid DESC LIMIT 1`;
        r2 = await dbConnector.submitSync(query, []);
        cwjy = { action: 'StopTransaction', evseSerial: result[i].evseSerial, userId: r2[0].userId, 
                  pdu: { transactionId: r2[0].trxid, meterStop: r2[0].meterNow, reason: 'Other', 
                  timestamp: Math.floor(Date.now()/1000)}};
        connDBServer.sendOnly(cwjy);
      }
    }


    //////////////////////////////////////////
    // notification all

    query = `SELECT * FROM notification WHERE expiry IS NULL`;
    result = await dbConnector.submitSync(query);

    for (var i in result) {
      switch (result[i].type) {
        case 'Angry':
          expiryAfter = constants.SQL_ANGRY_EXPIRY;
          query = `UPDATE notification SET expiry = DATE_ADD(NOW(), INTERVAL ? MINUTE)
                   WHERE recipientId = ? AND senderId = ?`;
          values = [constants.SQL_ANGRY_EXPIRY, result[i].recipientId, result[i].senderId];
          break;
        case 'Finishing':
          query = `UPDATE notification SET expiry = DATE_ADD(NOW(), INTERVAL ? MINUTE)
                   WHERE recipientId = ? AND evseSerial = ?`;
          values = [constants.SQL_FINISHING_EXPIRY, result[i].recipientId, result[i].evseSerial];
          break;
        case 'Waiting':
          expiryAfter = constants.SQL_WAITING_EXPIRY;
          query = `UPDATE notification SET expiry = DATE_ADD(NOW(), INTERVAL ? MINUTE)
                   WHERE recipientId = ? AND evseSerial = ?`;
          values = [constants.SQL_WAITING_EXPIRY, result[i].recipientId, result[i].evseSerial];
          break;
      }
      dbConnector.submit(query, values);
      query = `SELECT endPoint FROM user WHERE userId = ?`;
      values = [result[i].recipientId];
      r2 = await dbConnector.submitSync(query, values);
      if(r2) {
        msg = { data: { title: 'test title', body: 'body body', }, token: r2[0].endPoint, };
        sendPushNotification(msg);
      }
      else {
        console.log(`${Date.now().toLocaleString} :: no endPoint for ${resule[i].recipientId}`);
      }
      // send notification
      // send notification
      // send notification
    };

  };

  // currently not used. connect to dbms directly from here via dbConnector

  function sendPushNotification (message) {
    admin.messaging()
         .send(message)
         .then((response) => {
          console.log(`${new Date().toLocaleString()} push sent: ${JSON.stringify(response)}`);
         })
         .catch((err) => {
          console.log(`${new Date().toLocaleString()} :: ${err}`);
         });
  };

  const dbMonitor = {
    watch
  }
  return dbMonitor;
}

module.exports = DBMonitor;