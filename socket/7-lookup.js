'use strict';

const dns = require('node:dns/promises');

const options = { all: true, hints: dns.ADDRCONFIG | dns.V4MAPPED };

(async () => {
  const lookup = await dns.lookup('google.com', options);
  console.log(lookup);
})();
