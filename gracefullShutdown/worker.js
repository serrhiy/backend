'use strict';

const { scheduler } = require('node:timers/promises');

const LONG_RESPONSE = 3000;

const main = () => {
  console.log(`Forked: ${process.pid}`);
  process.on('message', (message, socket) => {
    socket.resume();
    console.log(`Connection: ${process.pid}`);  
    socket.on('data', async (data) => {
      console.log(`data from`, socket.remoteAddress);
      await scheduler.wait(LONG_RESPONSE);
      socket.write(data);
    });
    socket.on('end', () => {
      process.send(null, socket);
    });
  });
};

main();