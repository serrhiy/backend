'use strict';

const main = () => {
  const ws = new WebSocket('ws://127.0.0.1:8000');
  ws.onopen = () => {
    const user = { name: 'Serhii', age: 18, city: 'Kiyv' };
    const json = JSON.stringify(user);
    ws.send(json)
    ws.onmessage = (event) => {
      console.log(event);
    };
  };
  ws.onclose = () => console.log('Closed');
};

main();
