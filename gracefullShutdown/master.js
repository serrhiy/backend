'use strict';

const net = require('node:net');
const child_process = require('node:child_process');
const os = require('node:os');
const path = require('node:path');

const workerFile = path.join(__dirname, 'worker.js');
const PORT = 8000;
const HOST = '127.0.0.1';

const workers = [];
const workersConnections = [];

const fork = (index, connections = new Set()) => {
  const worker = child_process.fork(workerFile);
  for (const connection of connections) {
    connection.pause();
    worker.send(null, connection, { keepOpen: true });
  }
  worker.on('exit', () => {
    workers[index] = worker;
    fork(index, connections);
  });
  return { worker, connections };
}

const main = async () => {
  const cpus = os.availableParallelism();
  for (let i = 0; i < cpus; i++) {
    const { worker, connections } = fork(i);
    workers.push(worker);
    workersConnections.push(connections);
  }
  let index = 0;
  net.createServer({ pauseOnConnect: true }, (socket) => {
    const workerIndex = (index + 1) % cpus;
    const worker = workers[workerIndex];
    const connections = workersConnections[workerIndex];
    socket.on('close', () => {
      socket.removeAllListeners();
      connections.delete(socket);
    });
    connections.add(socket);
    worker.send(null, socket, { keepOpen: true });
    index++;
  }).listen(PORT, HOST);
};

main();
