'use strict';

const http = require('node:http');
const routing = require('./routing.js');
const tokens = require('./tokens.js');
const handle = require('./handle.js');
const { parse } = require('node:url');

const methods = { get: 'read', post: 'create', update: 'update', delete: 'delete' };

const ALLOWED_DOMAINS = [
  '127.0.0.1',
  '127.0.0.2',
];

module.exports = async (port, host, apiPath, load) => {
  const routes = await routing(apiPath, load, tokens);
  const getHandler = handle(routes);
  http.createServer((request, response) => {
    const { url, method, headers: { referer } } = request;
    const refererHost = parse(referer ?? '').hostname;
    const { handler, args } = getHandler(url, methods[method.toLowerCase()]);
    if (ALLOWED_DOMAINS.includes(refererHost)) {
      response.setHeader('Access-Control-Allow-Origin', '*');
    }
    if (handler === null) {
      response.statusCode = 404;
      return void response.end('Not found');
    }    
    const answer = handler(...args);
    response.end(JSON.stringify(answer));
  }).listen(port, host);
};
