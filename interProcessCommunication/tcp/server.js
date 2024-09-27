'use strict';

const net = require('node:net');

const user = { name: 'Marcus Aurelius', age: 1895 };

net.createServer(async (socket) => {
  socket.write(JSON.stringify(user));
  console.log('Socket connected');
  socket.on('data', (data) => {
    const message = data.toString();
    console.log('Server received:', message);  
  });
}).listen(2000);
