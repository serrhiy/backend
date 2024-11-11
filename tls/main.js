'use strict';

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const certpath = path.resolve(__dirname, 'certificate.pem');
const keypath = path.resolve(__dirname, 'private.pem');

const port = 8000;
const host = '127.0.0.1';

const onStart = () => {
  console.log(`HTTPS server starts at https://${host}:${port}`);
};

const prepareTLs = async () => ({
  key: await fs.promises.readFile(keypath),
  cert: await fs.promises.readFile(certpath)
});

const main = async () => {
  const options = await prepareTLs();
  https.createServer(options, (request, response) => {
    response.statusCode = 200;
    response.end('TLS works!');
  }).listen(port, host, onStart);
};

main();
