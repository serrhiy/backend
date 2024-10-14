'use strict';

const http = require('node:http');
const WebSocketServer = require('./ws/server.js');
const config = require('./config.js');

const main = () => {
  const ws = new WebSocketServer(new http.Server(), config);
  const messages = [];
  ws.on('connection', (socket) => {
    socket.send(JSON.stringify(messages));
    socket.on('message', (message) => {
      messages.push(message);
      for (const connection of ws.connections) {
        if (connection === socket) continue;
        const data = JSON.stringify([message]);
        connection.send(data);
      }
    });
  });
};

main();
