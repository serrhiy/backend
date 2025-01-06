'use strict';

const os = require('node:os');
const net = require('node:net');
const path = require('node:path');
const config = require('./config.json');
const { once } = require('node:events');
const threads = require('node:worker_threads');

const workerFile = path.join(__dirname, 'worker.js');

const spawnWorker = () => {
  const signal = AbortSignal.timeout(config.spawnTimeout);
  const worker = new threads.Worker(workerFile, { name: workerFile });
  return once(worker, 'online', { signal }).then(() => worker);
};

const foreverWorker = async (onRespawn, index) => {
  const worker = await spawnWorker();
  const connections = new Set();
  const onError = async (worker) => {
    console.log(`Respawn thread: ${worker.threadId}`);
    const newWorker = await spawnWorker();
    for (const connection of connections) {      
      const fd = connection._handle.fd;            
      connection.write('Hello world');
      newWorker.postMessage(fd);
    }
    newWorker.once('error', (err) => {
      console.log(err);
      void onError(newWorker);
    });
    onRespawn(index, newWorker);
  };
  worker.once('error', (err) => {
    console.log(err);
    void onError(worker);
  });
  return { worker, connections };
};

const foreverWorkers = async (cpus) => {
  const workers = [];
  const workersConnections = [];
  const onRespawn = (worker, index) => void (workers[index] = worker);
  for (let index = 0; index < cpus; index++) {
    const { worker, connections } = await foreverWorker(onRespawn, index);
    workers.push(worker);
    workersConnections.push(connections);
  }
  return { workers, connections: workersConnections };
};

const main = async () => {
  const cpus = os.availableParallelism();
  const { workers, connections } = await foreverWorkers(cpus);
  const server = new net.Server(config.server.options);
  let index = 0;
  server.on('connection', (socket) => {
    const fd = socket._handle.fd;
    const worker = workers[index];
    const workersConnections = connections[index];
    socket.on('close', () => void workersConnections.delete(socket));
    workersConnections.add(socket);
    worker.postMessage(fd);
    index = (index + 1) % cpus;
  });
  server.listen(config.server.port, config.server.host);
};

main();


