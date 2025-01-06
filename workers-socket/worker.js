'use strict';

const threads = require('node:worker_threads');
const { scheduler } = require('node:timers/promises');
const net = require('node:net');

const LONG_RESPONSE = 3000;
const { threadId } = threads;

const main = () => {
  console.log(`threadId: ${threadId}`);
  threads.parentPort.on('message', (fd) => {
    const socket = new net.Socket({ fd });
    socket.resume();
    const { remoteAddress } = socket;
    console.log(`Connection: ${remoteAddress}, thread: ${threadId}`);
    socket.on('data', async (data) => {
      if (data.toString() === 'kill') throw new Error('killed');
      console.log(`Data from: ${remoteAddress}, thread: ${threadId}`);
      await scheduler.wait(LONG_RESPONSE);
      socket.write(data);
    });
  });
};

main();