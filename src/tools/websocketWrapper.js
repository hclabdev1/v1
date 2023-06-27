const CONNECTION_TIMEOUT = 10 * 1000;
// websocket wrapper for charge point communication.

function WebSocketWrapper(server) {
  const WebSocketServer = require('websocket').server;
  var wss;
  var socketArray = [];
  var forwardingArray = [];

  wss = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  wss.on('request', function (request) {
    var connection = request.accept('hclab-protocol');
    var origin = String(request.resourceURL.pathname).slice(1, request.resourceURL.pathname.length);
    console.log('connected from ' + origin);

    connection.on('message', (message) => {
      console.log('incoming: ' + message.utf8Data);
      try {
        var incoming = JSON.parse(message.utf8Data);
        var parsed = (incoming[0] == 2) ? { messageType: incoming[0], uuid: incoming[1], action: incoming[2], pdu: incoming[3] }
                                        : { messageType: incoming[0], uuid: incoming[1], pdu: incoming[2] };
        if (parsed.messageType < 2 || parsed.messageType > 4) {
          console.log('websocket server: message is not valid. (messageType: 2, 3 or 4)');
          return;
        }
      } catch (e) {
        console.log('websocket server: message is not valid');
        return;
      }
      switch (parsed.messageType) {
        case 2:
          if(parsed.action == 'BootNotification') {
            storeConnection(origin, connection, true);
            forwardTo('boot', parsed, origin);
          }
          else {
            forwardTo('request', parsed, origin);
          }
          break;
        case 3:
          //console.log('DBG return from evse: ' + JSON.stringify(parsed));
          var found = forwardingArray.find(i => i.destination == origin);
          if(found)
            forwardTo(origin, parsed, null);
          else
            forwardTo('response', parsed, origin);
          break;
        case 4:
          break;
      }

    });

    connection.on('close', () => {
      console.log('connection close is called');
      //removeConnection(connection)
    });

  });

  showAllForwards = () => {
    forwardingArray.forEach((entry) => {
      console.log('showAllConnections: ' + entry.destination );
    });
  }
  showAllConnections = () => {
    socketArray.forEach((entry) => {
      console.log('showAllConnections: ' + entry.destination );
    });
  }

  ////////////////////////////////////////////
  // unique ID for identifying evse
  // not IP. It's constantly changing. not every hour tho
  // JSTech will cover this up. 
  storeConnection = function (destination, connection, forceRemove) {
    var found = socketArray.find( i  => i.destination == destination);
    if (!found || found.conn.socket.readyState > 1 || forceRemove) {
      removeConnection(destination);
      var sock = { destination: destination, conn: connection };
      socketArray.push(sock);
      //console.log(`store connection:  ${JSON.stringify(sock)}`);
    }
  }

  removeConnection = function (destination) {
    var index = socketArray.findIndex(i => i.destination == destination);
    if (index >= 0) {
      socketArray[index].conn.close();
      socketArray.splice(index, 1);
    }

  }

  sendTo = function (destination, data) {
    //console.log(`websocketWrapper:sendTo: ${JSON.stringify(data)}`);
    var sending = (data.messageType == 2) ? [data.messageType, data.uuid, data.action, data.pdu]
                                          : [data.messageType, data.uuid, data.pdu];
    //var sending = [data.messageType, data.uuid, data.action, data.pdu];
    console.log('sending: ' + JSON.stringify(sending));

    var found = socketArray.find(i => i.destination == destination);
    if (found) {
      found.conn.send(JSON.stringify(sending));
      return true;
    }
    else {
      console.warn(`wss:sendTo: No such client. ${destination} needs rebooting.`);
      return false;
    }
  }

  sendAndReceive = function (destination, data) {
    sendTo(destination, data);
    return new Promise((resolve, reject) => {
      var timeout = setTimeout(() => {
        console.log('timeout. 10 seconds');
        delistForwarding(destination);
        resolve(null);
        return;
      }, CONNECTION_TIMEOUT);
      enlistForwarding(destination, (result) => {
        clearTimeout(timeout);
        delistForwarding(destination);
        console.log('sendandreceive promise: ' + JSON.stringify(result));
        resolve(result);
      });
    });
  }

  enlistForwarding = function (destination, callback) {
    var cb = { destination: destination, forward: callback };
    forwardingArray.push(cb);
  }

  forwardTo = function (destination, param1, param2) {
    var found = forwardingArray.find( i => i.destination == destination);
    if (!found) {
      console.log('wss:response without request');
      return;
    }
    if (param2) {
      found.forward(param1, param2);
    }
    else {
      found.forward(param1);
    }
  }
  delistForwarding = function (destination) {
    var index = forwardingArray.findIndex(i => i.destination == destination);
    if (index >= 0) {
      forwardingArray.splice(index, 1);
    }
    else {
      console.error('wss:delistForwarding: delist weve got a problem. index: ' + index);
    }

  }

  const websocketWrapper = {
    storeConnection,
    removeConnection,
    sendTo,
    sendAndReceive,
    enlistForwarding,
    delistForwarding,
    showAllConnections,
    showAllForwards
  }
  return websocketWrapper;
}

module.exports = WebSocketWrapper;