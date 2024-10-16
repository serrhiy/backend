'use strict';

const events = require('node:events');
const { builder, parser } = require('./frame/main.js');
const getFrames = require('./getFrames.js');

const preparePong = () => Buffer.from([138, 0]); // to do

const prepareClose = () => Buffer.from([136, 0]); // to do

const preparePing = () => Buffer.from([137, 0]); // to do

const OPEN = 0;
const CLOSING = 1;
const CLOSED = 2;

const PING_TIMEOUT = 3000;

class Connection extends events.EventEmitter {
  #socket = null;
  #state = OPEN;
  #pingsTimers = [];

  constructor(socket) {
    super();
    this.#socket = socket;
    this.#getMessages();
    socket.on('end', this.#onEnd.bind(this));
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
        return void this.#onEnd();
      }
      if (opcode === 9) {
        return void this.send(preparePong(), true);
      }
      if (opcode === 10) {
        const timers = this.#pingsTimers;
        if (timers.length === 0) return;
        const timer = timers.shift();
        clearTimeout(timer);
      };
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
    for (const timer of this.#pingsTimers) clearTimeout(timer);
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

  ping() {
    const timers = this.#pingsTimers;
    const pingFrame = preparePing();
    this.send(pingFrame, true);
    const timer = setTimeout(this.#onEnd.bind(this), PING_TIMEOUT);
    timers.push(timer);
  }
};

module.exports = Connection;
