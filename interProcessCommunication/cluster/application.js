'use strict';

console.log('Hello from worker', process.pid);

const calculations = (x) => x * 2;

process.on('message', (message) => {
  console.log('Message to worker', process.pid);
  const result = message.task.map(calculations);
  process.send({ result });
});
