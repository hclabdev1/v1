// API server. constructor, initiation

process.title = process.argv[2];
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
//process.env.NODE_APP_INSTANCE = 1;

const express = require('express');
const app = express();
const cors = require('cors');
const https = require('https');
const fs = require('fs');

//var key = fs.readFileSync(__dirname + '/selfsigned.key');
//var cert = fs.readFileSync(__dirname + '/selfsigned.crt');
var key = fs.readFileSync(__dirname + '/privkey.pem');
var cert = fs.readFileSync(__dirname + '/fullchain.pem');
const server = https.createServer({key:key, cert: cert}, app);


app.use(express.json());
app.use(express.urlencoded({ extended: false}));

// Router for mobile app API
const v1Router = require('../mw/v1Router')(server);
app.use(cors());
app.use('/v1', v1Router);

// for landing page for landing page for landing page for landing page for landing page
const app2 = express();
const http2 = require('http');
const landingsvr = http2.createServer(app2);
var basedir = process.platform == 'linux' ? '/home/leo' : '/Users/leo';
app2.use(express.static(basedir + '/zeroone'));
app2.get('/:id', (req, res) => {
  res.sendFile(basedir + '/zeroone/index.html');
});
landingsvr.listen(3004, () => {
  console.log('landing server opened');
});
// for landing page for landing page for landing page for landing page for landing page


const config = require('config');
const apiserver = config.get('apiserver');

server.listen(apiserver.port, () => {
  console.log(`api server on. ${new Date()} port: ${apiserver.port} `);
  
});

// for console command