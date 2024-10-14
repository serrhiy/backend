'use strict';

const start = (data) => {
  const delta = Object.create(null);
  const commit = () => {
    Object.assign(data, delta);
    for (const key in delta) delete delta[key];
  };
  return new Proxy(data, {
    get: (target, key) => {
      if (key === 'commit') return commit;
      if (key in delta) return delta[key];
      return target[key];
    },
    set: (target, key, value) => {
      delta[key] = value;
      return true;
    }
  });
};

const data = { name: 'Marcus Aurelius', born: 121 };

const transaction = start(data);
console.log('data', JSON.stringify(data));
console.log('transaction', JSON.stringify(transaction));

transaction.name = 'Mao Zedong';
transaction.born = 1893;
transaction.city = 'Shaoshan';

console.log('\noutput with JSON.stringify:');
console.log('data', JSON.stringify(data));
console.log('transaction', JSON.stringify(transaction));

console.log('\noutput with console.dir:');
console.dir({ transaction, name: transaction.name, born: transaction.born });

console.log('\noutput with for-in:');
for (const key in transaction) {
  console.log(key, transaction[key]);
}

transaction.commit();
console.log('data', JSON.stringify(data));
console.log('transaction', JSON.stringify(transaction));