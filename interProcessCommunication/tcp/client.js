'use strict';

const net = require('node:net');

const main = () => {
  const options = { host: '127.0.0.1', port: 2000 };
  const socket = new net.Socket();
  socket.connect(options, () => {
    socket.write('Hello from client');
    socket.on('data', (data) => {
      const message = data.toString();
      console.log('Data received (by client):', message);
    });
  });
};

main();
