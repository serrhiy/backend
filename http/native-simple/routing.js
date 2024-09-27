'use strict';

const user = { name: 'Serhii', age: 18 };

module.exports = {
  '': () => '<h1>Welcome to homepage</h1><hr>',
  'user': {
    '': () => user,
    'name': () => user.name,
    'age': () => user.age,
  },
  'api': {
    'method1': (req, res) => {
      console.log(req.url + ' ' + res.statusCode);
      return { status: res.statusCode };
    },
    'method2': (req) => ({
      user,
      url: req.url,
      cookie: req.headers.cookie
    }),
  },
};
