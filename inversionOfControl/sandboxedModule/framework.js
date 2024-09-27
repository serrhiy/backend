'use strict';

const vm = require('node:vm');
const fs = require('node:fs');
const timers = require('node:timers/promises');

const filename = './application.js';

const main = async () => {
  const context = {
    module: {},
    console: Object.freeze({ ...console }),
    setTimeout: (...args) => timers.setTimeout(...args),
  };
  const sandbox = vm.createContext(context);
  const source = await fs.promises.readFile(filename, 'utf-8');
  const script = new vm.Script(source);
  const output = script.runInContext(sandbox, { timeout: 5000 });
  console.log({ output });
};

main()