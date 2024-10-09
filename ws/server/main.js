'use strict';

const http = require('node:http');
const hash = require('./hash.js');
const handshake = require('./handshake.js');
const parser = require('./parser.js');
const getFrames = require('./getFrames.js');

const buildAnswer = (message) => {
  const buffer = Buffer.alloc(message.length + 2);
  buffer[0] = 129;
  buffer[1] = message.length;
  Buffer.from(message).copy(buffer, 2, 0);
  return buffer;
};

const main = () => {
  const server = new http.Server();
  server.on('upgrade', async (request, socket, head) => {
    const { headers } = request;
    const { upgrade: protocol } = headers;
    const method = request.method.toLowerCase();
    if (protocol !== 'websocket' || method !== 'get') return;
    const key = headers['sec-websocket-key'];
    const hashed = hash(key);
    socket.write(handshake(hashed));
    const frames = await getFrames(socket);
    const decoder = new TextDecoder();
    const strings = [];
    for (const frame of frames) {
      const mask = parser.mask(frame);
      const content = parser.content(frame);
      const message = Uint8Array.from(content, (elt, i) => elt ^ mask[i % 4]);
      const string = decoder.decode(message);
      strings.push(string);
    }
    const data = strings.join('');
    const user = JSON.parse(data);
    const answer = { ...user, server: true };
    const json = JSON.stringify(answer);
    socket.write(buildAnswer(json));
    socket.on('error', console.log);
  });
  server.listen(8000, '127.0.0.1');
};

main();
