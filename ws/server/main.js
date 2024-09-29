'use strict';

const http = require('node:http');
const keyGenerator = require('./keyGenerator.js');
const parser = require('./parser.js');

const PORT = 8000;
const HOST = '127.0.0.1';

const sendWebSocketMessage = (socket, message) => {
  const messageBuffer = Buffer.from(message);
  const length = messageBuffer.length;
  let frame;
  if (length <= 125) {
    frame = Buffer.alloc(2 + length);
    frame[0] = 0x81;
    frame[1] = length;
    messageBuffer.copy(frame, 2);
  } else if (length <= 65535) {
    frame = Buffer.alloc(4 + length);
    frame[0] = 0x81;
    frame[1] = 126;
    frame.writeUInt16BE(length, 2);
    messageBuffer.copy(frame, 4);
  } else {
    frame = Buffer.alloc(10 + length);
    frame[0] = 0x81;
    frame[1] = 127;
    frame.writeBigUInt64BE(BigInt(length), 2);
    messageBuffer.copy(frame, 10);
  }

  socket.write(frame);
};


const main = () => {
  const server = new http.Server();
  server.on('upgrade', (request, socket, head) => {
    const { headers } = request;
    const key = headers['sec-websocket-key'];
    const cryptoKey = keyGenerator(key);
    const handshake = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${cryptoKey}`
    ];
    socket.write(handshake.concat('\r\n').join('\r\n'));
    socket.on('data', (chunk) => {
      const { mask, content } = parser(chunk);      
      const encrypted = Uint8Array.from(content, (elt, i) => elt ^ mask[i % 4]);
      const string = String.fromCharCode(...encrypted);
      const user = JSON.parse(string);
      user.server = true;
      const answer = JSON.stringify(user);
      sendWebSocketMessage(socket, answer);
    });
  });
  server.listen(PORT, HOST);
};

main();
