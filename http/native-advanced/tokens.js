'use strict';

module.exports = {
  number: { regexp: '([0-9]+)', parser: Number.parseInt },
  string: { regexp: '([a-zA-Z]+)', parser: (s) => s },
};
