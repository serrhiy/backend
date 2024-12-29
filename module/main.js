'use strict';

const vm = require('node:vm');
const fsp = require('node:fs/promises');
const path = require('node:path');

const sourcePath = path.join(__dirname, 'src');
const mainFile = path.join(sourcePath, 'main.js');

const sandbox = { print: console.log };

const filesContent = async (sourcePath) => {
  const options = { withFileTypes: true, recursive: true };
  const files = await fsp.readdir(sourcePath, options);
  const promises = [];
  for (const file of files) {
    if (!file.isFile() || !file.name.endsWith('.js')) continue;
    const fullpath = path.join(file.parentPath, file.name);
    const promise = fsp.readFile(fullpath, 'utf-8');
    promises.push(promise.then((src) => [fullpath, src]));
  }
  const entries = await Promise.all(promises);
  return new Map(entries);
};

const buildModules = (files, sandbox) => {
  const context = vm.createContext(sandbox);
  const modules = new Map();
  for (const [filepath, source] of files) {
    const options = { context, identifier: filepath };
    const module = new vm.SourceTextModule(source, options);
    modules.set(filepath, module);
  }
  return modules;
};

(async () => {
  const files = await filesContent(sourcePath);
  const modules = buildModules(files, sandbox);
  const mainModule = modules.get(mainFile);
  await mainModule.link((specifier, referencingModule) => {
    const { dir } = path.parse(referencingModule.identifier);
    const dependencyPath = path.join(dir, specifier);    
    if (!modules.has(dependencyPath)) {
      throw new Error(`Unable to resolve dependency: ${specifier}`);
    }
    return modules.get(dependencyPath);
  });
  await mainModule.evaluate().catch;
})();
