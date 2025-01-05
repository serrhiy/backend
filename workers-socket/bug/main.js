'use strict';

const os = require('node:os');
const net = require('node:net');
const path = require('node:path');
const config = require('./config.json');
const { once } = require('node:events');
const worker_threads = require('node:worker_threads');

const workerPath = path.join(__dirname, 'worker.js');

const spawnWorkers = (threads, timeout) => {
  const promises = [];
  const options = { name: workerPath };
  for (let index = 0; index < threads; index++) {
    const worker = new worker_threads.Worker(workerPath, options);
    const signal = AbortSignal.timeout(timeout);
    const promise = once(worker, 'online', { signal }).then(() => worker);
    promises.push(promise);
  }
  return Promise.all(promises);
};

const main = async () => {
  const threads = os.availableParallelism();
  const workers = await spawnWorkers(threads, config.spawnTimeout);
  const server = new net.Server(config.server.options);
  let index = 0;
  server.on('connection', (socket) => {
    const fd = socket._handle.fd;
    const worker = workers[index];
    worker.postMessage(fd);
    index = (index + 1) % threads;
  });
  server.listen(config.server.port);
};

main();


