'use strict';

const net = require('node:net');

const data = { name: 'Serhiy', age: 18 };

const main = () => {
  const options = { host: '127.0.0.1', port: 2000 };
  const socket = net.createConnection(options, () => {
    const message = JSON.stringify(data);
    socket.write(message);
    socket.on('data', (buffer) => {
      const answer = buffer.toString();
      const user = JSON.parse(answer);
      console.log('User: received', user);
      socket.end();
    });
  });
};

main();