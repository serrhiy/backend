'use strict';

const dgram = require('node:dgram');

const server = dgram.createSocket('udp4');

server.on('message', (buffer, rinfo) => {
  console.log({ data: buffer.toString(), rinfo });
});

server.bind(3000);
