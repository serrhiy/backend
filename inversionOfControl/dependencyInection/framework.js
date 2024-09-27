'use strict';

const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const { builtinModules } = require('node:module');

const EXECUTE_TIMEOUT = 5000;

const cache = new Map();

const runFile = async (filename) => {
  const filePath = path.join(process.cwd(), filename);
  if (cache.has(filePath)) return cache.get(filePath);
  const configFile = filename + 'on';
  const configPath = path.join(process.cwd(), configFile);
  const { api } = require(configPath);
  const dependencies = Object.create(null);
  dependencies.module = Object.create(null);
  for (const name of api) {
    const isBuiltin = builtinModules.includes(name);
    if (isBuiltin) dependencies[name] = require('node:' + name);
    else dependencies[name] = await runFile(name + '.js');
  }
  const sandbox = vm.createContext(Object.freeze({ ...dependencies }));
  const source = await fs.promises.readFile(filePath);
  const script = new vm.Script(source);
  script.runInContext(sandbox, { timeout: EXECUTE_TIMEOUT });
  cache.set(filePath, dependencies.module.exports);
  return dependencies.module.exports;
};

(async () => {
  await runFile('application.js');
})();
