'use strict';

const fs = require('node:fs');
const vm = require('node:vm');
const timers = require('node:timers');
const events = require('node:events');

const filename = './application.js';
const EXECUTION_TIMEOUT = 5000;

const main = async () => {
  const context = {
    module: {},
    api: {
      timers: Object.freeze({ ...timers }),
      events: Object.freeze({ ...events }),
    },
    require: (module) => {
      if (module === 'fs' || module === 'node:fs') {
        console.log('fs module is restricted!');
        return null;
      }
      return require(module);
    },
    console: Object.freeze({ ...console }),
  };
  context.global = context;
  const sandbox = vm.createContext(Object.freeze({ ...context }));
  const source = await fs.promises.readFile(filename, 'utf-8');
  const script = new vm.Script(source);
  const output = script.runInContext(sandbox, { timeout: EXECUTION_TIMEOUT });
  console.log({ output });
};

main();
