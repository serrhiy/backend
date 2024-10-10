'use strict';

const http = require('node:http');
const hash = require('./hash.js');
const handshake = require('./handshake.js');
const getMessages = require('./getMessages.js');
const frame = require('./frame.js');

const main = () => {
  const server = new http.Server();
  server.on('upgrade', async (request, socket) => {
    const { headers } = request;
    const { upgrade: protocol } = headers;
    const method = request.method.toLowerCase();
    if (protocol !== 'websocket' || method !== 'get') return;
    const key = headers['sec-websocket-key'];
    const hashed = hash(key);
    socket.write(handshake(hashed));
    for await (const message of getMessages(socket)) {      
      const user = JSON.parse(message);
      const answer = { ...user, server: true };
      const json = JSON.stringify(answer);
      const buffer = frame.build.fromString(json);
      socket.write(buffer);
    }
    socket.on('error', console.log);
  });
  server.listen(8000, '127.0.0.1');
};

main();
