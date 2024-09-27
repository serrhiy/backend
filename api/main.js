'use strict';

const load = require('./load.js');
const http = require('./services/http');
const staticServer = require('./services/static');

const sandbox = {
  users: [
    { name: 'Serhiy', age: 18, city: 'Kiyv' },
    { name: 'Andriy', age: 18, city: 'Lviv' },
    { name: 'Artem', age: 17, city: 'Kiyv' },
    { name: 'Maxim', age: 19, city: 'Chernigiv' },
    { name: 'Dima', age: 20, city: 'Kiyv' },
  ],
};

const main = async () => {
  await http(8000, '127.0.0.1', './api', load.bind(null, sandbox));
  await staticServer(8000, '127.0.0.2', './static');
};

main();
