'use strict';

const start = (data) => {
  const delta = Object.create(null);
  const deleted = new Set();
  const commit = () => {
    for (const key of deleted) delete data[key];
    Object.assign(data, delta);
    for (const key in delta) delete delta[key];

  };
  return new Proxy(data, {
    get: (target, key) => {
      if (key === 'delta') return delta;
      if (key === 'commit') return commit;
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
console.dir({ data });

transaction.city = 'Beijing';
delete transaction.born;

console.dir({
  keys: Object.keys(transaction),
  delta: transaction.delta
});

console.dir({ data });
transaction.commit();
console.dir({ data });
