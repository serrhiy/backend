'use strict';

const fsp = require('node:fs/promises');
const path = require('node:path');

const PATH = path.join(__dirname, 'sessions');
const ENCODING = 'utf-8';

const toBool = [() => true, () => false];

const exists = (file) => fsp.access(file).then(...toBool);

const safePath = (fn) => async (token, ...args) => {
  if (typeof token !== 'string') {
    throw new Error(`Error: invalid path type: ${typeof path}`);
  }
  const filepath = path.join(PATH, token);
  if (!filepath.startsWith(PATH)) {
    throw new Error('Error: invalid token');
  }
  return await fn(filepath, ...args);
};

const readSession = safePath(fsp.readFile);
const writeSession = safePath(fsp.writeFile);
const deleteSession = safePath(fsp.unlink);
const existsSession = safePath(exists);

class Storage {
  #cache = new Map();

  async get(token) {
    if (this.#cache.has(token)) { 
      return this.#cache.get(token);
    }
    const existsFile = await existsSession(token);
    if (!existsFile) return null;
    const string = await readSession(token, ENCODING);
    const value = JSON.parse(string);
    this.#cache.set(token, value);
    return value;
  }

  async save(token, value) {
    this.#cache.set(token, value);
    const json = JSON.stringify(value);
    const success = await writeSession(token, json, ENCODING).then(...toBool);
    return success;
  }

  async delete(token) {
    const cache = this.#cache;
    const existsFile = await existsSession(token);
    if (cache.has(token)) cache.delete(token);
    if (existsFile) deleteSession(token);
  }
}

module.exports = new Storage();
