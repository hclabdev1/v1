// API server. constructor, initiation

process.title = process.argv[2];
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
process.env.NODE_APP_INSTANCE = 1;

const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');

var key = fs.readFileSync(__dirname + '/selfsigned.key');
var cert = fs.readFileSync(__dirname + '/selfsigned.crt');
const server = https.createServer({key:key, cert: cert}, app);


app.use(express.json());
app.use(express.urlencoded({ extended: false}));

// Router for mobile app API
const v1Router = require('../mw/v1Router')(server);
app.use('/v1', v1Router);

const app2 = express();
const http2 = require('http');
const landingsvr = http2.createServer(app2);
app2.use(express.static('/home/leo/zeroone'));
app2.get('/:id', (req, res) => {
  res.sendFile('/home/leo/zeroone/index.html');
});

landingsvr.listen(3004, () => {
  console.log('landing server opened');
});


const config = require('config');
const apiserver = config.get('apiserver');

server.listen(apiserver.port, () => {
  console.log(`api server on. ${new Date(Date.now())} port: ${apiserver.port} `);
  
});

// for console command