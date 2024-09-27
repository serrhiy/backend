'use strict';

const http = require('node:http');
const routing = require('./routing.js');
const getController = require('./getController.js')(routing)

const types = {
  string: (str) => str,
  object: (obj) => JSON.stringify(obj),
  number: (num) => num.toString(),
};

const serialise = (value) => types[typeof value]?.(value);

http.createServer((request, response) => {
  const url = request.url.slice(1);
  const controller = getController(url);
  if (!controller) return void response.end('Not found!');
  const answer = serialise(controller(request, response));
  response.end(answer);
}).listen(8000);
