'use strict';

const events = require('node:events');
const { builder, parser } = require('./frame/main.js');
const { Buffer } = require('node:buffer');
const getFrames = require('./getFrames.js');

const preparePong = (pingFrame) => {
  const content = parser.content(pingFrame);
  const output = Buffer.allocUnsafe(content.length + 2);
  output[0] = 138;
  output[1] = content.length;
  content.copy(output, 2);
  return output;
};

const prepareClose = () => Buffer.from([136, 0]); // to do

const preparePing = () => Buffer.from([137, 0]); // to do

const OPEN = 0;
const CLOSING = 1;
const CLOSED = 2;

const PING_TIMEOUT = 3000;

class Connection extends events.EventEmitter {
  #socket = null;
  #state = OPEN;
  #pingTimer = null;

  constructor(socket) {
    super();
    this.#socket = socket;
    this.#getMessages();
    socket.on('end', this.#onEnd.bind(this));
  }

  #getMessages() {
    const chunks = [];
    const decoder = new TextDecoder();
    let dataType = -1;
    getFrames(this.#socket, (last, frame) => {
      const opcode = frame[0] & 15;
      const masked = frame[1] & 256;
      const rsv = frame[0] & 112;
      if (!masked || rsv) { /* Fail the WebSocket Connection */ }
      if (opcode === 8) return void this.#onClosing()
      if (opcode === 9) return void this.#onPing();
      if (opcode === 10) return void this.#onPong();
      if (opcode === 1 || opcode == 2) dataType = opcode;
      if (opcode !== 0) { /* Fail the WebSocket Connection */ }
      const mask = parser.mask(frame);
      const content = parser.content(frame);
      const message = Uint8Array.from(content, (elt, i) => elt ^ mask[i % 4]);
      const chunk = dataType === 1 ? decoder.decode(message) : message;
      chunks.push(chunk);
      if (!last) return;
      const result = dataType === 1 ? chunks.join('') : Buffer.concat(chunks);
      chunks.length = 0;
      this.emit('message', result);
    });
  }

  #onClosing() {
    if (this.#state !== CLOSING) this.close();
    this.#state = CLOSED;
    return void this.#onEnd();
  }

  #onPong() {
    if (!this.#pingTimer) return;
    clearTimeout(this.#pingTimer)
    this.#pingTimer = null;
  }

  #onPing() {
    const message = preparePong(frame);
    this.send(message, true);
  }

  #onEnd() {
    if (this.#pingTimer) clearTimeout(this.#pingTimer);
    this.#socket.destroy();
    this.#socket.removeAllListeners();
    this.emit('disconnect', this);
  }

  send(data, raw = false) {
    if (CLOSING) return;
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
    if (this.#pingTimer) return;
    const pingFrame = preparePing();
    this.send(pingFrame, true);
    this.#pingTimer = setTimeout(this.#onEnd.bind(this), PING_TIMEOUT);
  }
};

module.exports = Connection;
