'use strict';

const main = () => {
  const ws = new WebSocket('ws://127.0.0.1:8000');
  ws.onopen = () => {
    const timer = setInterval(() => {
      const data = { date: Date.now() };
      ws.send(JSON.stringify(data));
    }, 1000);
    ws.onmessage = ({ data }) => void console.log({ data });
    ws.onclose = () => void clearInterval(timer);
  };
};

main();
