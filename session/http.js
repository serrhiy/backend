'use strict';

const http = require('node:http');
const Storage = require('./storage.js');
const Session = require('./session.js')(Storage);

const methods = { get: 'read', post: 'create', update: 'update', delete: 'delete' };

module.exports = (port, host, routing) => {
  http.createServer(async (request, response) => {
    const session = await new Session(request, response);
    const { url, method } = request;
    const answer = routing(url, methods[method.toLowerCase()]);
    session.finish();
    if (answer === null) {
      response.statusCode = 404;
      return void response.end('Not found');
    }
    response.end(answer);
  }).listen(port, host);
};
