'use strict';

const fsp = require('node:fs/promises');
const http = require('node:http');

const lib = './lib/';
const toBool = [() => true, () => false];
const cache = new Map();

const exists = (filename) => fsp.access(filename).then(...toBool);

const cacheFile = async (filepath) => {
  const file = lib + filepath;
  const fileExists = await exists(file);
  if (!fileExists) return;
  const fullPath = require.resolve(file);
  delete require.cache[fullPath];
  try {
    const exports = require(file);
    cache.set(filepath, exports);
  } catch {
    cache.delete(filepath);
  }
};

const cacheFolder = async (path) => {
  const folderExists = await exists(path);
  if (!folderExists) return;
  const files = await fsp.readdir(path);
  const promises = files.map(cacheFile);
  await Promise.all(promises);
}

const watch = async (folder) => {
  for await (const { filename } of fsp.watch(folder)) {
    cacheFile(filename);
  }
};

const li = (response, list) => {
  response.write('<html>');
  for (const string of list) {
    response.write(`<li><a href="${string}/">${string}</li>`);
  }
  response.end('</html>');
};

const main = async () => {
  await cacheFolder(lib);
  watch(lib);
  http.createServer(async (request, response) => {
    const url = request.url.slice(1);
    if (!url) return void li(response, cache.keys());
    const [module, method] = url.split('/');
    if (cache.has(module)) {
      const methods = cache.get(module);
      if (!method) return void li(response, Object.keys(methods));
      if (method in methods) {
        const handler = methods[method];
        const answer = handler().toString();
        return void response.end(answer);
      }
    }
    response.end('File not found');
  }).listen(8000);
};

main();