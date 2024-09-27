'use strict';

const routing = require('./routing.js');
const load = require('./load.js');
const handle = require('./handle.js');
const tokens = require('./tokens.js');
const http = require('./http.js');

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
  const routes = await routing('./api', load.bind(null, sandbox), tokens);
  const handler = handle(routes);
  http(8000, '127.0.0.1', (url, method) => {
    const { handler: controller, args } = handler(url, method);
    if (!args) return null; 
    const answer = controller(...args);
    const serializer = serializers[typeof answer]
    return serializer(answer);
  });
};

main();
