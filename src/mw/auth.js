var constants = require('../lib/constants');
const config = require('config');
const smtp = config.get('smtp');
const service = config.get('service');

const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const uaparser = require('ua-parser-js');

const http = require('http');

const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');
const xmlp = new XMLParser();

function AuthController () {
  var pk = service.privatekey;
  var authList = [];

  let transporter = nodemailer.createTransport({
    service: smtp.service,
    host: smtp.host,
    port: smtp.port,
    secure: false,
    //requireTLS: true,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  const connDBServer = require('../lib/socketIOWrapper')('auth');

  sendAuthMail = async (req, res, next) => {

    var cwjy = { action: "AuthStatus", email: req.params.email };
    var result = await connDBServer.sendAndReceive(cwjy);
    if (result) {
      res.response = { responseCode: { type: 'error', name: 'signup', result: [{ status: 'the email is already in use' }] } };
      next();
      return;
    }

    var authItem = {
      email: req.params.email, exp: (Date.now() + constants.EMAIL_AUTH_EXPIRY),
      status: 1, code: Math.round(Math.random() * 900000 + 100000)
    };
    // code: 6 digits random number

    authList.push(authItem);

    // temporary for PoC
    /*
    var serviceUrl = (process.platform == 'linux') ? service.baseUrl : service.macUrl;
    let info = await transporter.sendMail({
        from: smtp.from, to: req.params.email,
        subject: 'HcLab email verification',
        html: `<HTML>
                <HEAD>
                 <META HTTP-EQUIV="Cache-Control" CONTENT="no-cache, no-store">
                 <META HTTP-EQUIV="Expires" CONTENT="0">
                </HEAD>
                <BODY> 
                 <A HREF = "${serviceUrl}/authentication/email/${authItem.code}" onclick="closetab()"> Click here </A>
                <script>
                  function closetab() {
                    window.close();
                  }
                  </script>
                </BODY>
               </HTML>`
    }).catch(console.error);

    console.log(new Date().toLocaleString() + 'sent: ' + JSON.stringify(info));
    */

    // temporary for PoC
    var index = authList.findIndex(i => i.email == req.params.email);
    connDBServer.sendOnly({ action: "EmailAuth", email: authList[index].email });
    authList[index].status = 2;
    // temporary for PoC

    res.response = { responseCode:  { type: 'page', name: 'waiting email verification' }, result: [] };
    next();
  }

  emailAuthStatus = async (req, res, next) => {
    var cwjy = { action: "AuthStatus", email: req.params.email};
    var resultDB = await connDBServer.sendAndReceive(cwjy);
    res.response = (resultDB) ? 
            { responseCode: { type: 'page', name: 'verification' }, result: [{ status: resultDB[0].authStatus }] } :
            { responseCode: { type: 'error', name: 'verification' }, result: [{ status: 'not found' }] };
    
    next();
  }

  signup = (req, res, next) => {
    var index = authList.findIndex(i => i.email == req.body.email);

    if(index >= 0 && authList[index].status == 2) {
      var cwjy = { action: "SignUp", email: req.body.email, password: req.body.password };
      connDBServer.sendOnly(cwjy);
      res.response = { responseCode: { type: 'page', name: 'signup' }, result: [{ status: 'Success' }] };
      next();
      authList.splice(index, 1);
      return;
    }
    res.response = { responseCode: { type: 'error', name: 'signup' }, result: [{ status: 'not authorized'}] };
    next();
  }

  // temporarily no auth. just storing
  sendAuthPhone = (req, res, next) => {
    var cwjy = { action: "RegisterPhone", phone: req.body.phone, email: req.body.email };
    connDBServer.sendOnly(cwjy);

    res.response = { responseCode: { type: 'page', name: 'register phone number'}, result: [{ status: 'Success'}]};
    next();
  }

  phoneStatus = (req, res, next) => {

    res.response = { responseCode: { type: 'page', name: 'phone status'}, result: [{ status: 'Success'}]};
    next();
  }

  emailAuth = (req, res, next) => {
    var index = authList.findIndex(i => i.code == req.params.code);
    if(index >= 0 && authList[index].exp > Date.now() && authList[index].status == 1) {
      connDBServer.sendOnly({ action: "EmailAuth", email: authList[index].email} );
      authList[index].status = 2;
      //res.response = { responseCode: { type: 'page', name: 'verification' }, result: [{status: 'Success'}] };
      res.response = "인증 완료";
      req.query = 2;
    } else {
      console.log(new Date().toLocaleString() + ' . verification failed');
      //res.response = { responseCode: { type: 'page', name: 'verification' }, result: [{status: 'Failed' }] };
      res.response = "인증 실패";
      req.query = 2;
    }

    console.log(res.response);
    next();
  }


  login = async (req, res, next) => {
    var cwjy = { action: 'Login', email: req.body.email, password: req.body.password};
    var result = await connDBServer.sendAndReceive(cwjy);
    //var token = jwt.sign({ email: req.body.email, exp: Math.floor(Date.now()/1000 + 3600 * 24 * 30) }, pk, { algorithm: 'HS256'});
    var token;
    if(result) {
      token = jwt.sign({ userId: result[0].userId }, pk, { algorithm: 'HS256' });
      var ua = uaparser(req.headers['user-agent']);
      cwjy = { action: 'PostLogin', userId: result[0].userId, email: req.body.email, fcmToken: req.body.fcmToken, loggedIn: ua.ua};
      connDBServer.sendOnly(cwjy);
      //console.debug(`${new Date().toLocaleString()} login submitted\n ${JSON.stringify(ua)}`);
    }
    res.response = (result) ? { responseCode: { type: 'page', name: 'welcome' }, result: [{ status: 'success', token: token, userId: result[0].userId}] } :
                              { responseCode: { type: 'page', name: 'welcome' }, result: [{ status: 'fail'}] };

    next();
  }

  autoLogin = async (req, res, next) => {

    console.log(new Date().toLocaleString() + '  autologin with: ' + JSON.stringify(req.body));
    var token = String(req.headers['authorization']).split(' ');
    if (token[0] != 'Bearer') {
      console.log('No Bear.');
      res.json({ responseCode: { type: 'error', name: 'wrong token'}, result: ['I hope you follow RFC recommendations. I dont want it either tho']});
      return;
    }
    try {
      var decode = jwt.verify(token[1], pk);
    } catch (e) {
      console.log('verification failed: ' + e);
      res.json({ responseCode: { type: 'error', name: 'wrong token'}, result: [] });
      return;
    }

    res.response = { responseCode: { type: 'page', name: 'welcome' }, result: decode.userId };
    /*
    var cwjy = { action: 'GetID', email: decode.email};
    var result = await connDBServer.sendAndReceive(cwjy);
    if(result) {
      res.response = { responseCode: { type: 'page', name: 'welcome' }, result: result[0].userId };
      console.log('decoded: ' + JSON.stringify(decode));
    }
    else {
      res.response = { responseCode: { type: 'error', name: 'no id' }, result: [] };
      console.log('decoded: ' + JSON.stringify(decode));
    }
    */
    next();

  }

  // for test
  getToken = async (req, res, next) => {
    var cwjy = { action: 'AuthStatus', email: req.params.test };
    var result = await connDBServer.sendAndReceive(cwjy);
    if(!result) {
      res.json({ responseCode: { type: 'error', name: 'no such a userId'}, result: [] });
      return;
    }
    console.log('userId: ' + result[0].userId);
    var token = jwt.sign({ userId: result[0].userId}, pk, { algorithm: 'HS256' });
    res.response = token;
    next();
  }

  verify = (req, res, next) => {

    var token = String(req.headers['authorization']).split(' ');
    if (token[0] != 'Bearer') {
      console.log(new Date().toLocaleString() + ' No Bear.');
      res.json({ responseCode: { type: 'error', name: 'wrong token'}, result: ['I hope you follow RFC recommendations. I dont want it either tho']});
      return;
    }
    try {
      var decode = jwt.verify(token[1], pk);
    } catch (e) {
      console.log(new Date().toLocaleString() + '  verification failed: ' + e);
      res.json({ responseCode: { type: 'error re-login', name: 'wrong token'}, result: [] });
      return;
    }

    console.log('userid: ' + decode.userId);
    req.params.user = decode.userId;
    req.body.user = decode.userId;

    next();
  }
  carInfo = (req, res, next) => {
    if(req.params.carNo == '0000') {
      res.response = { responseCode: { type: 'page', name: 'welcome' }, result: [] };
      next();
      return;
    }
    var svcCode = '0022C540A7B1DA55F28E479FABFF7BBC';
    var insttCode = '0022C540A79B38595E9AFB606843630E';
    var options = { hostname: '211.236.84.211',
                    port: 8181,
                    path: `/tsOpenAPI/minGamInfoService/getMinGamInfo?vhcleNo=${encodeURI(req.params.carNo)}&svcCode=${svcCode}&insttCode=${insttCode}`,
                    method: 'GET' };
    const request = http.request(options, (resFrom365) => {
      resFrom365.setEncoding('utf8');
      resFrom365.on('data', (rr) => {
        var car = xmlp.parse(rr);
        console.log('car info:' + JSON.stringify(car));
        if(car.response.body.vhcleWt > 0 && car.response.body.elctyCmpndFuelCnsmpRt) {
          var cwjy = {
            action: 'CarInfo', email: req.params.email,
            cmpnd: car.response.body.elctyCmpndFuelCnsmpRt,
            weight: car.response.body.vhcleWt
          };
          connDBServer.sendOnly(cwjy);
        } else {
          console.log(new Date().toLocaleString() + ': no car information');
        };
        
        /*

        try {
          var cwjy = {
            action: 'CarInfo', email: req.params.email,
            frwy: car.response.body.elctyFrwyFuelCnsmpRt,
            dwtw: car.response.body.elctyDwtWFuelCnsmpRt,
            cmpnd: car.response.body.elctyCmpndFuelCnsmpRt,
            weight: car.response.body.vhcleWt
          };
          connDBServer.sendOnly(cwjy);
        } catch (e) {
          var cwjy = {
            action: 'CarInfo', email: req.params.email,
            frwy: 0,
            dwtw: 0,
            cmpnd: 0,
            weight: 0
          };
          connDBServer.sendOnly(cwjy);
          console.log('no proper info');
        }
        */
      });

    }).on('error', (err) => {
      console.log('error:' + err);
    }).end();

    res.response = { responseCode: { type: 'page', name: 'welcome' }, result: [] };
    next();
  }

  test = (req, res, next) => {
    var authorization = req.headers['authorization'];
    console.log('authorization: ' + authorization);
    try {
      var decode = jwt.verify(authorization, pk);
    } catch (e) {
      console.log('verification failed: ' + e);
      res.response = 'wrong token';
      next();
      return;
    }
    res.response = decode;
    next();
  }
  const auth = {
    carInfo,
    test,
    sendAuthMail,
    emailAuthStatus,
    signup,
    sendAuthPhone,
    phoneStatus,
    emailAuth,
    login,
    autoLogin,
    getToken,
    verify
  }

    return auth;
}

module.exports = AuthController;

