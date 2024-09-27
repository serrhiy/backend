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
  const result = Object.create(null);
  if (!string) return result;
  const cookies = string.split(';');
  for (const cookie of cookies) {    
    const [key, value = ''] = cookie.split('=');
    result[key.trim()] = value.trim();
  }
  return result;
};

module.exports = (storage) => class Session {
  #response = null;
  #cookies = {};

  constructor(request, response) {
    this.#response = response;
    this.#cookies = parseCookies(request.headers.cookie);
    return this.#restoreCookie().then(() => this);
  }

  async #restoreCookie() {
    const cookie = this.#cookies;    
    if ('token' in cookie) {
      const storageCookie = await storage.get(cookie.token);      
      if (storageCookie) {
        this.#cookies = { ...storageCookie, ...this.#cookies  };
        return;
      }
    }
    cookie.token = generateToken();
  }

  setCookie(key, value) {
    this.#cookies[key] = value;
  }

  finish() {
    if (this.#response.headersSent) return;
    const cookies = [];
    for (const [key, value] of Object.entries(this.#cookies)) {
      const cookie =  key + '=' + value + '; ' + DEFAULT_COOKIE;
      cookies.push(cookie);
    }
    storage.save(this.#cookies.token, this.#cookies);
    this.#response.setHeader('Set-Cookie', cookies);
  }
};
