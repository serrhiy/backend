'use strict';

const http = require('node:http');
const routing = require('./routing.js');
const loadFiles = require('./loadFiles.js');

const prepareUrl = (url) => {
  const sliced = url.startsWith('/') ? url.slice(1) : url;
  return sliced.endsWith('/') ? sliced.slice(0, sliced.length - 1) : sliced;
};

module.exports = async (port, host, staticPath) => {
  const table = await routing(staticPath);
  const routes = await loadFiles(table);
  const server = http.createServer((request, response) => {
    const url = prepareUrl(request.url);
    if (!routes.has(url)) {
      response.statusCode = 404;
      return void response.end('<h1>Not found!</h1>');
    }
    response.writeHead(200, { 'Content-Encoding': 'gzip' });
    const buffer = routes.get(url);
    response.end(buffer);
  }).listen(port, host);
  return server;
};
