'use strict';

const events = require('node:events');
const { builder, parser } = require('./frame/main.js');
const getFrames = require('./getFrames.js');

const preparePong = () => Buffer.from([138, 0]); // to do

const prepareClose = () => Buffer.from([136, 0]); // to do

const OPEN = 0;
const CLOSING = 1;
const CLOSED = 2;

class Connection extends events.EventEmitter {
  #socket = null;
  #state = OPEN;

  constructor(socket) {
    super();
    this.#socket = socket;
    this.#getMessages();
  }

  #getMessages() {
    const dataChunks = [];
    const decoder = new TextDecoder();
    getFrames(this.#socket, (last, frame) => {
      const opcode = frame[0] & 15;
      const masked = frame[1] & 256;
      const rsv = frame[0] & 112;
      if (!masked || rsv) { /* Fail the WebSocket Connection */ }
      if (opcode === 8) {
        if (this.#state !== CLOSING) this.close();
        this.#state = CLOSED;
        this.#onEnd();
      }
      if (opcode === 9) return void this.send(preparePong(), true);
      if (opcode === 10) return;
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

  #onEnd() {
    this.#socket.destroy();
    this.#socket.removeAllListeners();
    this.emit('disconnect', this);
  }

  send(data, raw = false) {
    if (raw) return void this.#socket.write(data);
    if (typeof data === 'string') {
      const message = builder.fromString(data);
      return void this.#socket.write(message);
    }
  }

  close() {
    this.#state = CLOSING;
    const closingFrame = prepareClose();
    this.send(closingFrame, true);
  }
};

module.exports = Connection;
