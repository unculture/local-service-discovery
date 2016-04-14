const Client = require('../src/client').Client;
// Create a new server and start it
var client = new Client();
client.on('service-list-change', function(list) {
  console.log(JSON.stringify(list));
});
client.start();
