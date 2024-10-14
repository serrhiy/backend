'use strict';

const events = require('node:events');
const hash = require('./hash.js');
const handshake = require('./handshake.js');
const validRequest = require('./validRequest.js');
const Connection = require('./connection.js');

class WebSocketServer extends events.EventEmitter {
  #server = null;
  #connections = new Set();

  constructor(server) {
    super();
    this.#server = server;
    server.on('upgrade', this.#onUpgrade.bind(this));
  }

  #onUpgrade(request, socket) {
    if (!validRequest(request)) return;
    const { headers } = request;
    const key = headers['sec-websocket-key'];
    const hashed = hash(key);
    const connection = new Connection(socket);
    connection.send(handshake(hashed), true);
    connection.on('disconnect', this.#onDisconnect.bind(this));
    this.#connections.add(connection);
    this.emit('connection', connection);
  }

  #onDisconnect(connection) {
    this.#connections.delete(connection);
  }

  get connections() {
    return new Set(this.#connections);
  }

  get connectionsCount() {
    return this.#connections.size;
  }
};

module.exports = WebSocketServer;