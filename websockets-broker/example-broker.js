var fs = require('fs');
var cfg = JSON.parse(fs.readFileSync('example-config.json', 'utf8'));

var broker = new require('./wsbroker').Broker({
  port : cfg.wsPort,
  sessionCookieName : cfg.sessionCookieName,
  log : true,
  onClientMessage : function(message, connection) {
    console.log('MESSAGE RECEIVED!', message);
    // send an answer:
    connection.send(JSON.stringify({ 'type' : 42 }));
  },
  /*backend : {
    type : 'http',
    url : cfg.backendServer,
    }*/
  });

