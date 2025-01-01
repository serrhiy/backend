'use strict';

const threads = require('node:worker_threads');
const http2 = require('node:http2');
const path = require('node:path');
const fsp = require('node:fs/promises');

const certpath = path.join(__dirname, 'cert/cert.pem');
const keypath = path.join(__dirname, 'cert/key.pem');

const tlsOptions = async (keypath, certpath) => ({
  key: await fsp.readFile(keypath),
  cert: await fsp.readFile(certpath),
});

(async () => {
  const options = await tlsOptions(keypath, certpath);
  const { threadId, workerData } = threads;
  console.log(`Started. pid: ${process.pid}, threadId: ${threadId}, port: ${workerData.port}`);
  const server = http2.createSecureServer(options);
  server.on('stream', (stream, headers) => {
    const path = headers[':path'];
    if (path.includes('favicon.ico')) return;
    if (threadId === 10) throw new Error('Test error');
    console.log(`Received request. pid: ${process.pid}, id: ${threadId}`);
    stream.respond({ ':status': 200, 'content-type': 'text/html' });
    stream.end('<h1>Hello World</h1>');
  });
  server.listen(workerData.port);
})();
