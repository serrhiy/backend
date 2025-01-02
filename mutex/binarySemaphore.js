'use strict';

const threads = require('node:worker_threads');
const { Worker, isMainThread } = threads;

const LOCKED = 0;
const UNLOCKED = 1;

class BinarySemaphore {
  constructor(shared, offset, init = false) {
    this.lock = new Int32Array(shared, offset, 1);
    if (init) Atomics.store(this.lock, 0, UNLOCKED);
  }

  async enter() {
    while (true) {
      const atomics = Atomics.waitAsync(this.lock, 0, LOCKED);
      if (atomics.async) await atomics.value;
      const prev = Atomics.compareExchange(this.lock, 0, UNLOCKED, LOCKED);
      if (prev === UNLOCKED) return;
    }
  }

  leave() {
    const prev = Atomics.load(this.lock, 0);
    if (prev === UNLOCKED) {
      throw new Error('Cannot leave BinarySemaphore');
    }
    Atomics.store(this.lock, 0, UNLOCKED);
    Atomics.notify(this.lock, 0, 1);
  }
}

if (isMainThread) {
  const buffer = new SharedArrayBuffer(14);
  const semaphore = new BinarySemaphore(buffer, 0, true);
  console.dir({ semaphore });
  new Worker(__filename, { workerData: buffer });
  new Worker(__filename, { workerData: buffer });
} else {
  const { threadId, workerData } = threads;
  const semaphore = new BinarySemaphore(workerData);
  const array = new Int8Array(workerData, 4);
  const value = threadId === 1 ? 1 : -1;

  setInterval(async () => {
    await semaphore.enter();
    for (let i = 0; i < 10; i++) {
      array[i] += value;
    }
    console.dir([ threadId, semaphore.lock[0], array ]);
    semaphore.leave();
  }, 10); // change to 10 to see race condition
}