'use strict';

const zlib = require('node:zlib');
const fs = require('node:fs');

module.exports = async (routes) => {
  const result = new Map();
  for (const [key, filepath] of routes) {
    const readable = fs.createReadStream(filepath);
    const transform = zlib.createGzip();
    readable.pipe(transform);
    const chunks = [];
    for await (const chunk of transform) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    result.set(key, buffer);
  }
  return result;
};
