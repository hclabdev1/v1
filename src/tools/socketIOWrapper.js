////////////////////////////////////////////
// socketClient Object 
  const config = require('config');
  const dbserver = config.get('dbserver');
  const socketio = require('socket.io-client');

function SocketClient  (namespace)  {

  var io;

  if (namespace)
    io = socketio(`http://${dbserver.host}:${dbserver.port}/${namespace}`);
  else
    io = socketio(`http://${dbserver.host}:${dbserver.port}`);

  sendOnly = (msg) => {
    //io.emit('withReturn', msg, null);
    io.emit('cwjy', msg, null);
    //io.emit('noReturn', msg);
  }

  sendAndReceive = (msg) => {
    return new Promise((resolve, reject) => {
      //io.emit('withReturn', msg, (result) => {
      io.emit('cwjy', msg, (result) => {
        resolve(result);
      });
    });
  }

  const socketClient  = {
    sendOnly,
    sendAndReceive
  }

  return socketClient;
}

module.exports = SocketClient;