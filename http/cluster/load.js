'use strict';

const vm = require('node:vm');
const fsp = require('node:fs/promises');

module.exports = async (sandbox, filepath) => {
  const context = vm.createContext(sandbox);
  const text = await fsp.readFile(filepath, 'utf-8');
  const source = `'use strict';${text}`;
  const script = new vm.Script(source);
  const exported = script.runInContext(context, { timeout: 5000 });
  return exported;
};
