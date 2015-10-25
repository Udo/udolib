var fs = require('fs');
var cfg = JSON.parse(fs.readFileSync('example-config.json', 'utf8'));

var broker = new require('./wsbroker').Broker({
  port : cfg.wsPort,
  sessionCookieName : cfg.sessionCookieName,
  log : true,
  backend : {
    type : 'http',
    url : cfg.backendServer,
    }
  });

