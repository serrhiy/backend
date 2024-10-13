'use strict';

const http = require('node:http');
const WebSocketServer = require('./ws/server.js');

const main = () => {
  const httpServer = new http.Server();
  httpServer.listen(8000, '127.0.0.1');
  const ws = new WebSocketServer(httpServer);
  const messages = [];
  ws.on('connection', (socket) => {
    for (const message of messages) socket.send(message);
    socket.on('message', (message) => {
      messages.push(message);
      for (const connection of ws.connections) {
        if (connection !== socket) connection.send(message);
      }
    });
  });
};

main();
