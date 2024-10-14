'use strict';

const events = require('node:events');
const hash = require('./hash.js');
const handshake = require('./handshake.js');
const Connection = require('./connection.js');

const isValidHttpVersion = (httpVersion) => (
  Number.parseInt(httpVersion.replaceAll('.', '')) >= 11
);

class WebSocketServer extends events.EventEmitter {
  #server = null;
  #connections = new Set();

  constructor(server) {
    super();
    this.#server = server;
    server.on('upgrade', this.#onUpgrade.bind(this));
  }

  #onUpgrade(request, socket) {
    const { headers } = request;
    const { upgrade: protocol } = headers;
    const method = request.method.toLowerCase();
    const validVersion = isValidHttpVersion(request.httpVersion);
    if (!protocol.includes('websocket') || method !== 'get' || !validVersion) {
      return;
    }
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