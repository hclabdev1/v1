process.title = process.argv[2];
process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';
//process.env.NODE_APP_INSTANCE = 1;


var constants = require('../lib/constants');
const config = require('config');
const dbms = config.get('dbms');
const monitor = require('../mw/monitor')(dbms);
var monitorIns;

function init() {
  console.log('notification and monitoring server on.');

  startMonitor(60 * constants.NNMSVR_MONITORING_INTERVAL_MIN);
}

function stopMonitor() {
  clearInterval(monitorIns);
}

function startMonitor(sec) {
  monitorIns = setInterval(monitor.watch, 1000 * sec);
}

init();

