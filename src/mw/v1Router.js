const express = require('express');

var V1RouterWrapper = function (server) {
  var router = express.Router();
  const controller = require('./apiController')(server);
  const auth = require('./auth')();

  const multer = require('multer');
  const upload = multer({ dest: 'uploads/' });

  // hscan action is in one funtion
  // user related apis are divided in several functions
  // why? just for fun
  // JK. Which one looks better? which one is more efficient or productive?
  router.post('/signup/sendauthmail/:email', auth.sendAuthMail, controller.writeResponse);
  router.get('/signup/status/email/:email', auth.emailAuthStatus, controller.writeResponse);
  router.post('/signup/basic', auth.signup, controller.writeResponse);
  router.post('/signup/phone', auth.sendAuthPhone, controller.writeResponse);
  router.get('/signup/status/phone/:phone', auth.phoneStatus, controller.writeResponse);
  router.post('/signup/carspec/:email/:carNo', auth.carInfo, controller.writeResponse);

  //router.get('/signup/carnumber', auth.carInfo, controller.writeResponse);

  ////////////////////////////////////// 0825 started
  /////////////////////////////////////
  //router.post('/signup/card', auth.verify, controller.registerCard, controller.writeResponse);

  ////////////////////////////////////// 0825 started
  /////////////////////////////////////


  router.get('/authentication/email/:code', auth.emailAuth, controller.writeResponse);

  // . test test test test
  // for test convenience
  ///////////////////////////////////////////
  router.get('/signup/test/:code', auth.test, controller.writeResponse);
  router.get('/token/:test', auth.getToken, controller.writeResponse);
  router.get('/user/status/:user', controller.getUserStatus, controller.writeResponse); // parameters: userid
  router.get('/user/chargingstatus/:user', controller.getUserChargingStatus, controller.writeResponse); // parameters: userid
  router.get('/user/history/:user', controller.getUserChargingHistory, controller.writeResponse);       // parameters: userid, from-date, to-date
  router.get('/user/favorite/:user', controller.getUserFavo, controller.writeResponse);                 // parameters: userid
  router.get('/user/recent/:user', controller.getUserRecent, controller.writeResponse);                 // parameters: userid
  router.get('/chargepointlist', controller.getChargePointList, controller.writeResponse);            // parameters: chargepointid or set of (lat, lng, rng)
  router.get('/chargepoint/:cp', controller.getChargePointInfo, controller.writeResponse);            // parameters: chargepointid or set of (lat, lng, rng)
  router.get('/chargepoint/:cp/:user', controller.getChargePointInfo, controller.writeResponse);            // parameters: chargepointid or set of (lat, lng, rng)
  router.post('/user/favorite', controller.newUserFavo, controller.writeResponse);                 // parameters: userid
  router.delete('/user/favorite', controller.delUserFavo, controller.writeResponse);

  router.get('/login', auth.login, controller.writeResponse);
  router.get('/login/auto', auth.autoLogin, controller.writeResponse);
  // . test test test test

  router.post('/login', auth.login, controller.writeResponse);
  router.post('/login/auto', auth.autoLogin, controller.writeResponse);

  //

  router.put('/hscan/scan', controller.waitAndGo, controller.hScan, controller.writeResponse);
  router.put('/hscan/action', controller.waitAndGo, controller.hAction, controller.writeResponse);
  //router.put('/hscan/scan', auth.verify, controller.waitAndGo, controller.hScan, controller.writeResponse);
  //router.put('/hscan/action', auth.verify, controller.waitAndGo, controller.hAction, controller.writeResponse);

  //router.post('/hscan/report/:evse', controller.postDamageReport, controller.writeResponse);
  //router.post('/hscan/report/:evse', upload.array('photos', 5), controller.postDamageReport, controller.writeResponse);
  router.post('/hscan/report/:evse', upload.single('photos'), controller.postDamageReport, controller.writeResponse);

  router.get('/user/info', auth.verify, controller.getUserInfo, controller.writeResponse);
  router.get('/user/status', auth.verify, controller.getUserStatus, controller.writeResponse); // parameters: userid
  router.get('/user/chargingstatus', auth.verify, controller.getUserChargingStatus, controller.writeResponse); // parameters: userid
  router.get('/user/history', auth.verify, controller.getUserChargingHistory, controller.writeResponse);       // parameters: userid, from-date, to-date
  router.get('/chargepointlist', auth.verify, controller.getChargePointList, controller.writeResponse);            // parameters: chargepointid or set of (lat, lng, rng)
  router.get('/chargepoint/:cp', auth.verify, controller.getChargePointInfo, controller.writeResponse);            // parameters: chargepointid or set of (lat, lng, rng)

  router.get('/user/favorite', auth.verify, controller.getUserFavo, controller.writeResponse);                 // parameters: userid
  router.get('/user/recent', auth.verify, controller.getUserRecent, controller.writeResponse);                 // parameters: userid
  router.post('/user/favorite', auth.verify, controller.newUserFavo, controller.writeResponse);                 // parameters: userid
  router.delete('/user/favorite', auth.verify, controller.delUserFavo, controller.writeResponse);

  // CSMS (Charging Station Management System) API
  router.get('/csms/list/cp', controller.csmsListCP, controller.writeResponse);        
  router.get('/csms/list/evse', controller.csmsListEVSE, controller.writeResponse);    
  router.get('/csms/history/cp', controller.csmsHistoryCP, controller.writeResponse);  
  router.get('/csms/history/evse', controller.csmsHistoryEVSE, controller.writeResponse); 
  router.get('/csms/report/cp', controller.csmsReportCP, controller.writeResponse);
  router.get('/csms/report/user', controller.csmsReportUser, controller.writeResponse);
  //router.put('/csms', controller.csmsControl, controller.writeResponse);                          // 

  return router;
}

module.exports = V1RouterWrapper;