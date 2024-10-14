'use strict';

const start = (data) => {
  const delta = Object.create(null);
  const deleted = new Set();
  const events = { commit: [], rollback: [] };
  const emit = (name, ...args) => {
    const event = events[name];
    for (const callback of event) callback(...args);
  };
  const methods = {
    commit: () => {
      for (const key of deleted) delete data[key];
      Object.assign(data, delta);
      for (const key in delta) delete delta[key];
      emit('commit');
    },
    rollback: () => {
      for (const key in delta) delete delta[key];
      emit('rollback');
    },
    on: (name, callback) => {
      const event = events[name];
      if (event) event.push(callback);
    },
  };
  return new Proxy(data, {
    get: (target, key) => {
      if (key === 'delta') return delta;
      if (methods.hasOwnProperty(key)) return methods[key];
      if (key in delta) return delta[key];
      return target[key];
    },
    set: (target, key, value) => {
      delta[key] = value;
      if (deleted.has(key)) deleted.delete(key);
      return true;
    },
    getOwnPropertyDescriptor: (target, key) => {
      const hasOwnProperty = Object.prototype.hasOwnProperty.call(delta, key);
      const obj = hasOwnProperty ? delta : target;
      return Object.getOwnPropertyDescriptor(obj, key);
    },
    ownKeys: (target) => {
      const unique = new Set([...Object.keys(target), ...Object.keys(delta)]);
      return Array.from(unique);
    },
    deleteProperty: (target, key) => {
      const hasOwnProperty = Object.prototype.hasOwnProperty.call(target, key);
      if (!hasOwnProperty || deleted.has(key)) return false;
      deleted.add(key);
      return true;
    },
  });
};

const data = { name: 'Marcus Aurelius', born: 121 };

const transaction = start(data);

transaction.on('commit', () => {
  console.log('\ncommit transaction');
});

transaction.on('rollback', () => {
  console.log('\nrollback transaction');
});

transaction.city = 'Shaoshan';
transaction.rollback();
transaction.city = 'Shaoshan';
transaction.commit();

console.dir({ data });