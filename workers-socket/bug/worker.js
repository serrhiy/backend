'use strict';

const net = require('node:net');
const http = require('node:http');
const threads = require('node:worker_threads');

const main = () => {
  const server = new http.Server();
  server.on('request', (request, response) => {
    console.log(`ThreadId: ${threads.threadId}`);
    response.end('Hello world');
  });
  threads.parentPort.on('message', (fd) => {
    const socket = new net.Socket({ fd });
    server.emit('connection', socket);
    socket.resume();
  });
};

main();
