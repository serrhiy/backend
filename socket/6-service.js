'use strict';

const dns = require('node:dns/promises');

(async () => {
  const ip = await dns.resolve('github.com')[0];
  const address = ip ?? '140.82.121.4';
  const { hostname, service } = await dns.lookupService(address, 443);
  console.log({ hostname, service });
})();