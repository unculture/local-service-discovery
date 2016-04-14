'use strict';
const dgram = require('dgram');
const util = require('util');
const events = require('events');

// Constants
const DEFAULT_MULTICAST_ADDRESS = '224.0.0.234';
const DEFAULT_ADDRESS = '0.0.0.0';
const DEFAULT_PORT = 44202;

// export the object for users of the module.

function Client(options) {
  // Create a dgram socket and bind it
  this.socket = null;
  this.port = (options && options.port) ? options.port : DEFAULT_PORT;
  this.address = (options && options.address) ? options.address : DEFAULT_ADDRESS;
  this.multicastAddress = (options && options.multicastAddress) ? options.multicastAddress : DEFAULT_MULTICAST_ADDRESS;
  this.serviceList = {};
}

// We use events and must inherit from events.EventEmitter
util.inherits(Client, events.EventEmitter);

Client.prototype.processMessage = function(message, rinfo) {
  if (message) {
    var obj = JSON.parse(message.toString());
  }
  this.updateServiceList(obj, rinfo);
};

Client.prototype.connect = function() {
  var self = this;
  this.socket = dgram.createSocket('udp4');
  this.socket.on('listening', function() {
    self.socket.addMembership(DEFAULT_MULTICAST_ADDRESS);
  });
  this.socket.on('message', this.processMessage.bind(this));
  self.socket.bind(this.port, this.address);
};

Client.prototype.start = function() {
  if (!this.socket) {
    this.connect();
  }
};

Client.prototype.stop = function() {
  if (this.socket) {
    this.socket.close();
    this.socket = null;
  }
};

Client.prototype.updateServiceList = function(data, rinfo) {
  this.serviceList[rinfo.address + ":" + rinfo.port] = data;
  this.emit('service-list-change', this.serviceList);
};

exports.Client = Client;

