'use strict';

const http = require('node:http');
const { AsyncLocalStorage } = require('node:async_hooks');

const PORT = 8000;
const HOST = '127.0.0.1';

const application = {
  requestId: 0,
  user: { name: 'Marcus', age: 17 },
  asyncLocalStorage: new AsyncLocalStorage()
};

const routing = {
  '/': '<h1>welcome to homepage</h1><hr>',
  '/method/': async (request, response) => {
    const id = application.asyncLocalStorage.getStore();
    console.log(`${id} ${request.method} ${request.url} ${response.statusCode}`);
    application.asyncLocalStorage.exit(() => {
      if (id) console.log({ id });
    });
    return { id, user: application.user };
  }
};

const serialisers = {
  undefined: () => 'not found',
  string: (s) => s,
  function: async (fn, request, response) => {
    const answer = await fn(request, response);
    return JSON.stringify(answer);
  }
}

http.createServer((request, response) => {
  const { url } = request;
  const name = url.endsWith('/') ? url : url + '/';
  const data = routing[name];
  const type = typeof data;
  const serialiser = serialisers[type];
  const id = application.requestId++;
  application.asyncLocalStorage.run(id, async () => {
    const answer = await serialiser(data, request, response);
    response.end(answer);
  });
}).listen(PORT, HOST);