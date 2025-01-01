'use strict';

const child_process = require('node:child_process');
const range = require('./range.js');
const path = require('node:path');
const os = require('node:os');

const masterpath = path.join(__dirname, 'master.js');
const port = 8000;

(() => {
  const availableProcesses = os.availableParallelism();
  for (const index of range(availableProcesses)) {
    const masterPort = port + availableProcesses * index;
    const env = { port: masterPort, threadsCount: availableProcesses };
    child_process.fork(masterpath, { env });
  }
})();
