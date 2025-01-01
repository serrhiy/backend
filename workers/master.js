'use strict';

const threads = require('node:worker_threads');
const process = require('node:process');
const range = require('./range.js');
const path = require('node:path');

const workerPath = path.join(__dirname, 'worker.js');
const port = Number.parseInt(process.env.port, 10);
const threadsCount = Number.parseInt(process.env.threadsCount, 10);

const foroverWorker = (workerPath, options) => {
  const worker = new threads.Worker(workerPath, options);
  worker.once('error', (error) => {
    console.log(`Thread ${worker.threadId} died with message ${error.message}`);
    foroverWorker(workerPath, options);
  });
};

(() => {
  for (const index of range(threadsCount)) {
    const workerData = { port: port + index };
    const options = { name: workerPath, workerData };
    foroverWorker(workerPath, options);
  }
})();
