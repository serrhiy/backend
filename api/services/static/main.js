'use strict';

const http = require('node:http');
const routing = require('./routing.js');
const loadFiles = require('./loadFiles.js');
const contentType = require('./contentType.js');

const prepareUrl = (url) => {
  const sliced = url.startsWith('/') ? url.slice(1) : url;
  return sliced.endsWith('/') ? sliced.slice(0, sliced.length - 1) : sliced;
};

module.exports = async (port, host, staticPath) => {
  const table = await routing(staticPath);
  const routes = await loadFiles(table);
  const types = contentType(table);
  const server = http.createServer((request, response) => {
    const url = prepareUrl(request.url);
    if (!routes.has(url)) {
      response.statusCode = 404;
      return void response.end('<h1>Not found!</h1>');
    }
    const type = types.get(url);
    const head = {
      'Content-Encoding': 'gzip',
      'Content-Type': type
    };
    response.writeHead(200, head);
    const buffer = routes.get(url);
    response.end(buffer);
  }).listen(port, host);
  return server;
};
