import scaffold from './scaffold.js';

const structure = {
  users: {
    '': ['read'],
    'admin': ['read'],
    '[variable]': {
      'test': {
        '': ['read']
      }
    }
  },
  '': ['read']
};

const main = async () => {
  const api = scaffold(structure);
  const person = await api.users.variable(2).test.read();
  console.log(person);
};

main();
