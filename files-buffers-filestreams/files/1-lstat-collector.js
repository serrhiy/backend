'use strict';

const fs = require('node:fs');

class DataCollector {
  #onDone = null;
  #expected = 0;
  #data = new Map();
  #finshed = false;

  constructor(expected) {
    this.#expected = expected;
  }

  collect(key, value) {
    if (this.#finshed) return this;
    this.#data.set(key, value);
    if (this.#expected === this.#data.size) {
      this.#finshed = true;
      this.#onDone(this.#data);
    }
    return this;
  }

  done(onDone) {
    this.#onDone = onDone;
    return this;
  }
}

const collect = (expected) => new DataCollector(expected);

const getStats = (files) => {
  const collector = collect(files.length);
  for (const file of files) {
    fs.lstat(file, (err, stats) => {
      collector.collect(file, err ?? stats);
    });
  }
  return collector;
};

const files = ['1-lstat-collector.js', 'first.txt'];

getStats(files).done(console.log);
