'use strict';

const main = () => {
  const ws = new WebSocket('ws://127.0.0.1:8000');
  ws.onopen = () => {
    console.log('Connected');
    const user = { name: 'Stew', age: 18 };
    const json = JSON.stringify(user);
    ws.send('client'.repeat(30));
    ws.onmessage = (event) => {
      console.log(event.data);
    };
  };
  ws.onclose = () => console.log('Closed');
};

main();
