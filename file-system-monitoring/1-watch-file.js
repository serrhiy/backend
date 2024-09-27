'use strict';

const fs = require('node:fs');

const FILE = '1-watch-file.js';

const print = async (filepath) => {
  const content = await fs.promises.readFile(filepath, 'utf-8');
  console.log('\x1Bc');
  console.log(content);
};

fs.watch(FILE, (event, filename) => {
  print(filename);
});

print(FILE);
