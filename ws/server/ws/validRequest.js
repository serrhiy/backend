'use strict';

const validators = {
  validHttpVersion: (request) => {
    const version = request.httpVersion.replaceAll('.', '');
    return Number.parseInt(version) >= 11;
  },
  validMethod: (request) => {
    const method = request.method.toLowerCase();
    return method === 'get';
  },
  validUpdateField: (request) => {
    const { headers: { upgrade } } = request;
    if (!upgrade) return false;
    return upgrade.includes('websocket');
  },
  validConnectionField: (request) => {
    const { headers: { connection } } = request;
    if (!connection) return false;
    return connection.includes('Upgrade');
  },
  validKey: (request) => 'sec-websocket-key' in request.headers,
  validWebSocketVersion: (request) => {
    return request.headers['sec-websocket-version'] === '13';
  }
};

module.exports = (request) => {
  for (const validator of Object.values(validators)) {
    if (!validator(request)) return false;
  }
  return true;
};
