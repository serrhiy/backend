'use strict';

const routing = require('./routing.js');
const load = require('./load.js');
const handle = require('./handle.js');
const tokens = require('./tokens.js');
const http = require('./http.js');

const BASE_PORT = 2000;

const sandbox = {
  users: [
    { name: 'Serhiy', age: 18, city: 'Kiyv' },
    { name: 'Andriy', age: 18, city: 'Lviv' },
    { name: 'Artem', age: 17, city: 'Kiyv' },
    { name: 'Maxim', age: 19, city: 'Chernigiv' },
    { name: 'Dima', age: 20, city: 'Kiyv' },
  ],
};

const serializers = {
  undefined: (x) => '',
  object: (x) => JSON.stringify(x ?? ''),
  number: (x) => x.toString(),
  string: (x) => x,
};

const main = async () => {
  const id = Number.parseInt(process.argv[2], 10);
  console.log(`Fork: ${process.pid}, Id: ${id}, Port: ${BASE_PORT + id}`);
  const routes = await routing('./api', load.bind(null, sandbox), tokens);
  const handler = handle(routes);
  http(BASE_PORT + id, '127.0.0.1', (url, method) => {
    console.log(`Work: ${process.pid}, Id: ${id}`);
    const { handler: controller, args } = handler(url, method);
    if (!controller) return null; 
    const answer = controller(...args);
    const serializer = serializers[typeof answer]
    return serializer(answer);
  });
};

main();

