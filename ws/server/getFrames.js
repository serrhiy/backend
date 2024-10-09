'use strict';

const { on } = require('node:events');
const parser = require('./parser.js');

module.exports = async (socket) => {
  const frames = [];
  const chunks = [];
  let lastFrameLength = 0;
  let totalLength = 0;
  for await (const [chunk] of on(socket, 'data')) {
    chunks.push(chunk);
    totalLength += chunk.length;
    if (lastFrameLength === 0) {
      const first = chunks[0];
      const arg = first.length >= 2 ? first : Buffer.concat(chunks);
      lastFrameLength = parser.frameLength(arg);
    }
    if (totalLength < lastFrameLength) continue
    const total = Buffer.concat(chunks);
    const frame = total.subarray(0, lastFrameLength);
    const rest = total.subarray(lastFrameLength);
    frames.push(frame);
    chunks.length = 0;
    chunks.push(rest);
    totalLength = rest.length;
    lastFrameLength = 0;
    const last = frame.readUInt8(0) & 128;
    if (last) return frames;
  }
};
