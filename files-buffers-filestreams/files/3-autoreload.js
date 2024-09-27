'use strict';

const fs = require('node:fs');

const FILENAME = '3-autoreload.js';

const print = async (filepath) => {
  console.log(filepath);
  
  const content = await fs.promises.readFile(filepath, 'utf-8');
  console.log('\x1Bc');
  console.log(content);
};

const watch = (filepath) => {
  fs.watch(filepath, print.bind(null, filepath));
};

print(FILENAME);
watch(FILENAME);
