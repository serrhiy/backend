'use strict';

module.exports = (secretKey) => (
  'HTTP/1.1 101 Switching Protocols\r\n' +
  'Upgrade: websocket\r\n' +
  'Connection: Upgrade\r\n' +
  `Sec-WebSocket-Accept: ${secretKey}\r\n\r\n`
);
