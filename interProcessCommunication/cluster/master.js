'use strict';

const cluster = require('node:cluster');
const os = require('node:os');

const workerName = './application.js';
const TIME_OUT = 5000;

const main = () => {
  const cpus = Math.ceil(os.cpus().length / 4);
  const workers = new Set();
  for (let i = 0; i < cpus; i++) {
    const options = { signal: AbortSignal.timeout(TIME_OUT) };
    const worker = cluster.fork(workerName, options);
    workers.add(worker);
  }
  const task = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const results = new Set();
  for (const worker of workers) {
    worker.send({ task });
    worker.on('message', (message) => {
      console.log('Message from worker', worker.process.pid);
      results.add(message.result);
      worker.disconnect();
      if (results.size === cpus) {
        console.log({ results });
        process.exit(0);
      }
    });
  }
  setTimeout(() => process.exit(1), TIME_OUT);
};

main()
