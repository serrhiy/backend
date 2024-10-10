'use strict';

const { parser } = require('./frame/main.js');

const getFrames = (socket, next) => {
  const chunks = [];
  let lastFrameLength = 0;
  let totalLength = 0;
  socket.on('data', (chunk) => {
    chunks.push(chunk);
    totalLength += chunk.length;
    if (lastFrameLength === 0) {
      const first = chunks[0];
      const arg = first.length >= 2 ? first : Buffer.concat(chunks);
      lastFrameLength = parser.frameLength(arg);
    }
    if (totalLength < lastFrameLength) return;
    const total = Buffer.concat(chunks);
    const frame = total.subarray(0, lastFrameLength);
    const last = frame.readUInt8(0) & 128;
    next({ frame, last });
    const rest = total.subarray(lastFrameLength);
    chunks.length = 0;
    lastFrameLength = 0;
    totalLength = 0;
    if (rest.length >= 2) socket.emit('data', rest);
  });
};

module.exports = (socket, listener) => {
  const dataChunks = [];
  const decoder = new TextDecoder();
  getFrames(socket, ({ last, frame }) => {
    const mask = parser.mask(frame);
    const content = parser.content(frame);
    const message = Uint8Array.from(content, (elt, i) => elt ^ mask[i % 4]);
    const dataChunk = decoder.decode(message);
    dataChunks.push(dataChunk);
    if (!last) return;
    const result = dataChunks.join('');
    dataChunks.length = 0;
    listener(result);
  });
};
