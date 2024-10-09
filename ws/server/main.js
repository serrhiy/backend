'use strict';

const http = require('node:http');
const hash = require('./hash.js');
const handshake = require('./handshake.js');
const parser = require('./parser.js');

const buildAnswer = (message) => {
  const buffer = Buffer.alloc(message.length + 2);
  buffer[0] = 129;
  buffer[1] = message.length;
  Buffer.from(message).copy(buffer, 2, 0);
  return buffer;
};

const main = () => {
  const server = new http.Server();
  server.on('upgrade', async (request, socket) => {
    const { headers } = request;
    const { upgrade: protocol } = headers;
    if (protocol !== 'websocket') return;
    const clientKey = headers['sec-websocket-key'];
    const hashed = hash(clientKey);
    socket.write(handshake(hashed));
    socket.on('data', (chunk) => {
      const encoded = chunk.readInt8(1) & 128;
      if (!encoded) return void socket.end();
      const opcode = chunk.readUInt8(0) & 15;
      const last = chunk.readUInt8(0) & 128;
      const mask = parser.getMask(chunk);
      const content = parser.getContent(chunk);
      const message = Uint8Array.from(content, (elt, i) => elt ^ mask[i % 4]);
      const string = String.fromCharCode(...message);
      console.log({ opcode, length: string.length, last });
      const answer = buildAnswer('server');
      socket.write(answer);
    });
    socket.on('error', console.log);
  });
  server.listen(8000, '127.0.0.1');
};

main();
