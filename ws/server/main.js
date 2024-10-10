'use strict';

const http = require('node:http');
const hash = require('./hash.js');
const handshake = require('./handshake.js');
const parser = require('./parser.js');
const getFrames = require('./getFrames.js');
const frame = require('./frame.js');
const stream = require('node:stream');
const timers = require('node:timers');

function byteToBinaryString(s) {
  return s.toString(2).padStart(8, '0');
}

const main = () => {
  // const buffer = frame.build.fromString('a'.repeat(65536));
  // console.log([...buffer].map(byteToBinaryString).join(' '));
  const server = new http.Server();
  server.on('upgrade', async (request, socket) => {
    const { headers } = request;
    const { upgrade: protocol } = headers;
    const method = request.method.toLowerCase();
    if (protocol !== 'websocket' || method !== 'get') return;
    const key = headers['sec-websocket-key'];
    const hashed = hash(key);
    socket.write(handshake(hashed));
    const decoder = new TextDecoder();
    const strings = [];
    for await (const frame of getFrames(socket)) {
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
    const buffer = frame.build.fromString('a'.repeat(100));
    const source = stream.Readable.from(buffer);
    source.pipe(socket);
    socket.on('error', console.log);
  });
  server.listen(8000, '127.0.0.1');
};

main();
