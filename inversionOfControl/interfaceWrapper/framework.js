'use strict';

const fs = require('node:fs/promises');
const vm = require('node:vm');
const path = require('node:path');
const { createRequire } = require('node:module');

const filename = './application.js';
const EXECUT_TIMEOUT = 10000;

const main = async () => {
  const context = {
    console: Object.freeze({ ...console }),
    Promise: require('./logablePromise.js')(process.stdout),
    require: createRequire(path.join(process.cwd(), filename)),
  };
  const sandbox = vm.createContext(context);
  const source = await fs.readFile(filename);
  const script = new vm.Script(source);
  script.runInContext(sandbox, { timeout: EXECUT_TIMEOUT });
};

main();
