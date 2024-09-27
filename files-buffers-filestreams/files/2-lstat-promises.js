'use strict';

const fsp = require('node:fs/promises');

const files = ['1-lstat-collector.js', 'first.txt'];
const promises = files.map(fsp.lstat);
Promise.allSettled(promises).then(console.log);