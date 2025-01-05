'use strict';

const net = require('node:net');
const config = require('./config.json');

const main = () => {
  const { port, host } = config.server;
  const socket = new net.Socket();
  socket.on('data', (data) => {
    console.log({ data: data.toString() });
  });
  socket.connect({ port, host });
};

main();
