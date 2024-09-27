'use strict';

const dgram = require('dgram');

const socket = dgram.createSocket('udp4');

socket.send('Hello world!', 3000, '127.0.0.1', (error) => {
  socket.close();
});