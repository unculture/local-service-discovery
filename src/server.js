'use strict';

const dgram = require('dgram');

// Constants
const DEFAULT_MULTICAST_ADDRESS = '224.0.0.234';
const DEFAULT_CLIENT_PORT = 44202;
const DEFAULT_BROADCAST_INTERVAL = 5000;

/**
 * Server takes options
 * clientPort - what port are we multicasting to?
 * multicastAddress - which multicast ip shall we join?
 * broadcastInterval - how often in milliseconds should we broadcast
 * On start it broadcasts every 5 seconds on the local network
 */
function Server(options) {
  this.clientPort = (options && options.clientPort) ? options.clientPort : DEFAULT_CLIENT_PORT;
  this.multicastAddress = (options && options.multicastAddress) ? options.multicastAddress : DEFAULT_MULTICAST_ADDRESS;
  this.broadcastInterval = (options && options.broadcastInterval) ? options.broadcastInterval : DEFAULT_BROADCAST_INTERVAL;
  this.socket = null;
  this.interval = null;
  this.publicDetails = null;
}

Server.prototype.connect = function(cb) {
  var self = this;

  // Create a dgram socket and bind it
  self.socket = dgram.createSocket('udp4');

  self.socket.on('error', function(error) {
    console.log(error);
    console.log(self.socket.address());
  });

  self.socket.bind(function () {
    self.socket.setBroadcast(true);
    self.socket.setMulticastLoopback(true);
    if (cb) {
      cb();
    }
  });

};

Server.prototype.start = function(details) {
  // Start broadcasting the ip and port that I'm running on
  // Maybe with details about screen size etc
  // May need to connect
  var start = function() {
    this.publicDetails = details;
    if (this.interval) {
      clearInterval(this.interval);
    }
    // do i need to bind this?
    this.interval = setInterval(this.send.bind(this), this.broadcastInterval);
  }.bind(this);
  
  if (!this.socket) {
    this.connect(start);
  } else {
    start();
  }
};

Server.prototype.pause = function () {
  // Pause broadcasting..
  if (this.interval) {
    clearInterval(this.interval);
  }
};

Server.prototype.stop = function () {
  // Stop broadcasting, close the socket
  if (this.interval) {
    clearInterval(this.interval);
  }
  if (this.socket) {
    this.socket.close();
    this.socket = null;
  }
};

Server.prototype.send = function() {
  var buf = new Buffer(JSON.stringify(this.publicDetails));
  this.socket.send(buf, 0, buf.length, this.clientPort, this.multicastAddress);
};

// export the object for users of the module.
exports.Server = Server;

