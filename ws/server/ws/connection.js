'use strict';

const events = require('node:events');
const { builder, parser } = require('./frame/main.js');

class Connection extends events.EventEmitter {  
  #socket = null;

  constructor(socket) {
    super();
    this.#socket = socket;
    this.#getMessages();
  }

  #getMessages() {
    const dataChunks = [];
    const decoder = new TextDecoder();
    this.#getFrames((last, frame) => {
      if ((frame[0] & 15) === 9) return void this.send(preparePong(), true);
      if ((frame[0] & 15) === 8) return void this.#onEnd();
      if ((frame[0] & 15) === 10) return;
      const mask = parser.mask(frame);
      const content = parser.content(frame);
      const message = Uint8Array.from(content, (elt, i) => elt ^ mask[i % 4]);
      const dataChunk = decoder.decode(message);
      dataChunks.push(dataChunk);
      if (!last) return;
      const result = dataChunks.join('');
      dataChunks.length = 0;
      this.emit('message', result);
    });
  }

  #getFrames(next) {
    const chunks = [];
    let lastFrameLength = 0;
    let totalLength = 0;
    this.#socket.on('data', (chunk) => {
      chunks.push(chunk);
      totalLength += chunk.length;
      if (lastFrameLength === 0) {
        const first = chunks[0];
        const arg = first.length >= 2 ? first : Buffer.concat(chunks);
        if (arg.length >= 2) lastFrameLength = parser.frameLength(arg);
      }
      if (totalLength < lastFrameLength) return;
      const total = Buffer.concat(chunks);
      const frame = total.subarray(0, lastFrameLength);
      const last = frame.readUInt8(0) & 128;
      next(last, frame);
      const rest = total.subarray(lastFrameLength);
      chunks.length = 0;
      lastFrameLength = 0;
      totalLength = 0;
      if (rest.length > 0) socket.emit('data', rest);
    });
  }

  #onEnd() {
    this.#socket.destroy();
    this.emit('disconnect', this);
  }

  send(data, raw = false) {
    if (raw) return void this.#socket.write(data);
    if (typeof data === 'string') {
      const message = builder.fromString(data);
      return void this.#socket.write(message);
    }
  }
};

module.exports = Connection;