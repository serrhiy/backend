'use strict';

const dns = require('node:dns/promises');

(async () => {
  const google = await dns.resolveAny('google.com');
  const github = await dns.resolveAny('github.com');
  console.log({ google, github });
})();
