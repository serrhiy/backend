'use strict';

const net = require('node:net');

const PORT = 2000;

const processData = (data) => ({ ...data, city: 'Kiyv' });

net.createServer((socket) => {
  console.log('Server: connection');
  socket.on('data', (data) => {
    const message = data.toString();
    const user = JSON.parse(message);
    console.log('Server: recieved', user);
    const answer = JSON.stringify(processData(user));
    socket.write(answer);
  });
  socket.on('close', () => {
    console.log('Server: socket closed');
  });
}).listen(PORT, { noDelay: true });
