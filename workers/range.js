'use strict';

module.exports = (end, step = 1) => ({
  [Symbol.iterator]: () => {
    let index = 0;
    const next = () => {
      const result = { value: index, done: index >= end };
      index += step;
      return result;
    };
    return { next };
  },
});