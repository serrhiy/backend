'use strict';

const MAX_AGE = (30 * 24 * 60 * 60).toString(); // 30 days
const DEFAULT_COOKIE = `Max-Age=${MAX_AGE}; Path=/; Secure; HttpOnly`;

const TOKEN_LENGTH = 128;
const ALPHA_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHA_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const ALPHA = ALPHA_UPPER + ALPHA_LOWER;
const DIGIT = '0123456789';
const ALPHA_DIGIT = ALPHA + DIGIT;

const generateToken = () => {
  const base = ALPHA_DIGIT.length;
  const chars = new Array(TOKEN_LENGTH);
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    const index = Math.floor(Math.random() * base);
    chars.push(ALPHA_DIGIT[index]);
  }
  return chars.join('');
};

const parseCookies = (string) => {
  const result = new Map();
  if (!string) return result;
  const cookies = string.split(';');
  for (const cookie of cookies) {    
    const [key, value = ''] = cookie.split('=');
    result.set(key.trim(), value.trim());
  }
  return result;
};

module.exports = (storage) => class Session {
  #response = null;
  #cookies = null;

  constructor(request, response) {
    this.#response = response;
    this.#cookies = parseCookies(request.headers.cookie);
    return this.#restoreCookie().then(() => this);
  }

  async #restoreCookie() {
    const cookie = this.#cookies;
    if (cookie.has('token')) {
      const token = cookie.get('token');
      const storageCookie = await storage.get(token);
      if (storageCookie) {
        return void (this.#cookies = storageCookie);
      }
    }
    cookie.set('token', generateToken());
  }

  setCookie(key, value) {   
    this.#cookies.set(key, value);
  }

  finish() {
    if (this.#response.headersSent) return;
    this.setCookie('x', 'y');
    const token = this.#cookies.get('token');
    const cookieToken = `token=${token}; ${DEFAULT_COOKIE}`;
    storage.save(token, this.#cookies);
    this.#response.setHeader('Set-Cookie', cookieToken);
  }
};
