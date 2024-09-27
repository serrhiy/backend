'use strict';

const http = require('node:http');

const methods = { get: 'read', post: 'create', update: 'update', delete: 'delete' };

module.exports = (port, host, routing) => {
  const server = http.createServer((request, response) => {
    const { url, method } = request;
    const answer = routing(url, methods[method.toLowerCase()]);
    if (answer === null) {
      response.statusCode = 404;
      return void response.end('Not found');
    }
    response.end(answer);
  }).listen(port);
  return server;
};
