'use strict';

const fs = require('node:fs');
const threads = require('node:worker_threads');
const { Worker, isMainThread } = threads;

class CountingSemaphore {
  constructor(shared, offset = 0, initial) {
    this.counter = new Int32Array(shared, offset, 1);
    if (typeof initial === 'number') {
      Atomics.store(this.counter, 0, initial);
    }
  }

  async enter() {
    while (true) {
      const atomics = Atomics.waitAsync(this.counter, 0, 0);
      if (atomics.async) await atomics.value;
      const n = Atomics.load(this.counter, 0);
      if (n <= 0) continue;
      const prev = Atomics.compareExchange(this.counter, 0, n, n - 1);
      if (prev === n) return;
    }
  }

  leave() {
    Atomics.add(this.counter, 0, 1);
    Atomics.notify(this.counter, 0, 1);
  }
}

if (isMainThread) {
  const buffer = new SharedArrayBuffer(4);
  const semaphore = new CountingSemaphore(buffer, 0, 2);
  console.dir({ semaphore: semaphore.counter[0] });
  for (let i = 0; i < 20; i++) {
    new Worker(__filename, { workerData: buffer });
  }
} else {
  const { threadId, workerData } = threads;
  const semaphore = new CountingSemaphore(workerData);
  const REPEAT_COUNT = 1000000;
  const file = `file-${threadId}.dat`;
  console.dir({ threadId, semaphore: semaphore.counter[0] });
  semaphore.enter().then(() => {
    const data = `Data from ${threadId}`.repeat(REPEAT_COUNT);
    fs.writeFile(file, data, () => {
      fs.unlink(file, () => {
        semaphore.leave();
      });
    });
  });
}