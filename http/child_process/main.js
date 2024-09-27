'use strict';

const child_process = require('node:child_process');
const os = require('node:os');

const worker = './worker.js';

const main = () => {
  const cpus = os.availableParallelism();
  for (let i = 0; i < cpus; i++) {
    child_process.fork(worker, [i]);
  }
};

main();
