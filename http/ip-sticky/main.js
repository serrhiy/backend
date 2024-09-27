'use strict';

const routing = require('./routing.js');
const load = require('./load.js');
const handle = require('./handle.js');
const tokens = require('./tokens.js');
const http = require('./http.js');
const cluster = require('node:cluster');
const net = require('node:net');
const os = require('node:os');

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

const ipToInt = (ip) => ip.split('.')
  .reduce((res, item) => res * 256 + parseInt(item), 0);

const master = async () => {
  const cpus = os.availableParallelism();
  console.log(`Master: ${process.pid}, Forks: ${cpus}`);
  const workers = [];
  for (let i = 0; i < cpus; i++) {
    const worker = cluster.fork();
    workers.push(worker);
  }
  net.createServer({ pauseOnConnect: true }, (socket) => {
    const ip = socket.remoteAddress;
    const ipv4 = ip.slice(ip.lastIndexOf(':') + 1);
    const number = ipToInt(ipv4);
    const id = number % cpus;
    const worker = workers[id];
    worker.send({ name: 'socket' }, socket);
  }).listen(2000);
};

const worker = async () => {
  console.log(`Fork: ${process.pid}, Node id: ${cluster.worker.id}`);
  const routes = await routing('./api', load.bind(null, sandbox), tokens);
  const handler = handle(routes);
  const server = http(null, null, (url, method) => {
    console.log(`Work: ${process.pid}, Node id: ${cluster.worker.id}`);
    const { handler: controller, args } = handler(url, method);
    if (!args) return null; 
    const answer = controller(...args);
    const serializer = serializers[typeof answer]
    return serializer(answer);
  });
  process.on('message', (message, socket) => {
    if (message.name !== 'socket') return;
    server.emit('connection', socket);
    socket.resume();
  });
};

const main = () => {
  if (cluster.isPrimary) master();
  else worker();
};

main();
