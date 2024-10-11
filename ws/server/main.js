'use strict';

const http = require('node:http');
const hash = require('./hash.js');
const handshake = require('./handshake.js');
const getMessages = require('./getMessages.js');
const frame = require('./frame/main.js');

const main = () => {
  const connections = new Set();
  const messages = [];
  const server = new http.Server();
  server.on('upgrade', (request, socket) => {    
    const { headers } = request;
    const { upgrade: protocol } = headers;
    const method = request.method.toLowerCase();
    if (protocol !== 'websocket' || method !== 'get') return;
    const key = headers['sec-websocket-key'];
    const hashed = hash(key);
    socket.write(handshake(hashed));
    connections.add(socket);
    socket.on('end', () => {
      socket.destroy();
      connections.delete(socket);
    });
    for (const message of messages) {
      socket.write(frame.builder.fromString(message));
    }
    getMessages(socket, (message) => {
      messages.push(message);
      for (const connection of connections) {
        if (connection === socket) continue;
        const buffer = frame.builder.fromString(message);        
        connection.write(buffer);
      }
    });
  });
  server.listen(8000, '127.0.0.1');
};

main();
