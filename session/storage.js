'use strict';

const fsp = require('node:fs/promises');
const path = require('node:path');
const v8 = require('node:v8');

const PATH = path.join(__dirname, 'sessions');

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
    const existsFile = await existsSession(token);    
    if (this.#cache.has(token)) {
      const session = this.#cache.get(token);
      if (!existsFile) await this.save(token, session);
      return session;
    }
    if (!existsFile) return null;
    const buffer = await readSession(token);
    const session = v8.deserialize(buffer);
    this.#cache.set(token, session);
    return session;
  }

  async save(token, session) {
    this.#cache.set(token, session);
    const serialised = v8.serialize(session);
    await writeSession(token, serialised).then(...toBool);
  }

  async delete(token) {
    const cache = this.#cache;
    const existsFile = await existsSession(token);
    if (cache.has(token)) cache.delete(token);
    if (existsFile) deleteSession(token);
  }
}

module.exports = new Storage();
