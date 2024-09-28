'use strict';

const path = require('node:path');

const MIME_TYPES = {
  default: 'application/octet-stream',
  html: 'text/html; charset=UTF-8',
  js: 'application/javascript; charset=UTF-8',
  css: 'text/css',
  png: 'image/png',
  jpg: 'image/jpg',
  gif: 'image/gif',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
};

module.exports = (routing) => {
  const result = new Map();
  for (const [route, filepath] of routing) {
    const extention = path.extname(filepath).slice(1);
    const value = MIME_TYPES[extention] ?? MIME_TYPES.default;
    result.set(route, value);
  }
  return result;
};