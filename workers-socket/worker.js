'use strict';

const net = require('node:net');
const threads = require('node:worker_threads');

const main = () => {
  threads.parentPort.on('message', (fd) => {
    const socket = new net.Socket({ fd });
    socket.resume();
    console.log(`threadId: ${threads.threadId}`);
    socket.end('Hello world!');
  });
};

main();
