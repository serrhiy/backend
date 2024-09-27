'use strict';

const http = require('node:http');

const PORT = 8000;
const HOSTNAME = '127.0.0.1';

const server = http.createServer((request, response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/plain');
  response.end('Hello world!');
});

server.listen(PORT, HOSTNAME, () => {
  console.log(`erver running at http://${HOSTNAME}:${PORT}/`);
});

server.on('error', (error) => {
  console.log(`Error: ${error.message}`);
})
