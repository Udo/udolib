var QueryString = require('querystring');
var Http = require('http');
var Url = require('url');
var Request = require('request');
var HttpServer = require("http"); 
var Lodash = require("lodash"); 
var WS = require('ws');
var WebSocketServer = require('ws').Server;
 
var safeParseJSON = function(raw) {
  if(!typeof raw == 'string') return(raw);
  var result = {};
  try {
    result = JSON.parse(raw);
  } catch(ee) {
    result.json_error = ee+' // source: '+raw;
  }
  return(result);
}

var getCookies = function(connection) {
  var cookies = {};
  if (connection.upgradeReq.headers.cookie) {
    connection.upgradeReq.headers.cookie.split(";")
      .forEach(function (item) {
        var pts = item.split('=');
        cookies[pts[0].trim().toLowerCase()] = pts[1];
      });
  }
  return(cookies);
}

var onWSClose = function(broker, connection) {
  if(broker.config.log)
    console.log('← connection closed', connection.sessionInfo.wskey);     
  if(broker.config.onClientDisconnect)
    broker.config.onClientDisconnect(connection);
  sendBackendMessage(broker, connection, { type : 'session-disconnect' });
}

var match = function(crit1, crit2) {
  var result = true;
  Lodash.forEach(crit1, function(val, key) {
    var val1 = val+'';
    var val2 = crit2[key]+'';
    if(val1.toLowerCase() != val2.toLowerCase())
      result = false;
  });
  return(result);
}

var backendCommands = {
  
  log : function(broker, connection, message) {
    console.log('! log', message.text);
  },
  
  session : function(broker, connection, message) {
    if(message.data && connection) {
      Lodash.merge(connection.sessionInfo, message.data);
    }
  },
  
  response : function(broker, connection, message) {
    if(connection) {
      sendClientMessage(broker, connection, message.message);
    }
  },
  
  close : function(broker, connection, message) {
    if(connection)
      connection.close();
  },
  
  send : function(broker, connection, message) {
    var payload = JSON.stringify(message.message);
    Lodash.forEach(broker.clients, function(connection) {
      if(!message.match || match(message.match, connection.sessionInfo))
        connection.send(payload);
    });
  },
  
}

var onBackendMessage = function(broker, connection, message) {
  if(message.length > 0)
    Lodash.forEach(message, function(cmd, key) {
      if(broker.config.log)
        console.log('↓ from backend', cmd);
      if(broker.config.backendCommands[cmd.type])
        broker.config.backendCommands[cmd.type](cmd, connection, broker);
      else if(backendCommands[cmd.type])
        backendCommands[cmd.type](broker, connection, cmd);
      else if(broker.config.onBackendMessage)
        broker.config.onBackendMessage(cmd, connection, broker);
      else if(broker.config.log)
        console.log('! unknown backend command', cmd);
    });
}

var sendBackendMessage = function(broker, connection, message, whenDone) {
  if(broker.config.backend && broker.config.backend.type == 'http') {
    var data = { message : JSON.stringify(message), connection : JSON.stringify(connection.sessionInfo) };
    if(broker.config.log)
      console.log('↑ to backend', message);
    Request.post(
      { url : broker.config.backend.url, formData: data}, 
      function(upstreamError, httpResponse, body) {
        var backendResponse = safeParseJSON(body);
        if(upstreamError && broker.config.log)
          console.log('! backend error', err, data);
        else if(whenDone)
          whenDone(backendResponse);
        else
          onBackendMessage(broker, connection, backendResponse);
      });
  }
}

var onClientMessage = function(broker, connection, messageRaw) {
  message = safeParseJSON(messageRaw);
  if(broker.config.log)
    console.log('→ from client', connection.sessionInfo.wskey, message);
  var dosendBackendMessage = true;
  if(broker.config.onClientMessage)
    dosendBackendMessage = broker.config.onClientMessage(message, connection);
  if(dosendBackendMessage) {
    if(!message.type || message.type.substr(0, 7) != 'client-')
      message.type = 'client-'+(message.type || 'message');
    sendBackendMessage(broker, connection, message);
  }
}

var sendClientMessage = function(broker, connection, message) {
  connection.send(JSON.stringify(message));
  if(broker.config.log)
    console.log('← to client', connection.sessionInfo.wskey, message);
}

var onWSConnection = function(broker, connection) {
  try {
    connection.broker = broker;
    connection.cookieData = getCookies(connection);
    connection.sessionInfo = {
      session_id: connection.cookieData[broker.config.sessionCookieName],
      ip: connection.upgradeReq.headers['x-forwarded-for'],
      wskey: connection.upgradeReq.headers['sec-websocket-key'],
      };
    if(broker.config.log)
      console.log('↪ new connection', connection.sessionInfo.wskey, connection.sessionInfo.session_id);     
    connection.on('message', function(message) { onClientMessage(broker, connection, message); });
    connection.on('close', function() { onWSClose(broker, connection); });
    var dosendBackendMessage = true;
    if(broker.config.onClientConnect) 
      dosendBackendMessage = broker.config.onConnection(connection);
    if(dosendBackendMessage)
      sendBackendMessage(broker, connection, { type : 'session-connect' });
  } catch (ee) {
    if(broker.config.log)
      console.log('! Connection Error', ee);
  }
}

var onError = function(broker, error) {
  if(broker.config.log)
    console.log('! Error', error);
}

var initWebSocketServer = function(broker) {
  var wsrv = new WebSocketServer({
    port: broker.config.port,
    });  
  wsrv.on('connection', broker.onWSConnection);
  wsrv.on('error', broker.onError);
  if(broker.config.log)
    console.log('➥ websocket server listening on port ' + broker.config.port);
  return(wsrv);
}

exports.Broker = function(config) {
  var broker = this;
  broker.config = config;
  if(!config.backendCommands) config.backendCommands = {};
  broker.onWSConnection = function(connection) { onWSConnection(broker, connection); };
  broker.onError = function(error) { onError(broker, error); }; 
  broker.websocketServer = initWebSocketServer(broker);
}
