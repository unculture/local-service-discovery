const Server = require('../src/server').Server;
// Create a new server and start it
var server = new Server();
server.start({
  teapot: true,
  shortAndStout: true
});
