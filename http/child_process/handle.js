'use strict';

const prepareUrl = (url) => {
  const sliced = url.startsWith('/') ? url.slice(1) : url;
  return sliced.endsWith('/') ? sliced.slice(0, sliced.length - 1) : sliced;
};

module.exports = (routes) => (url, method) => {
  const prepared = prepareUrl(url);    
  const { fixed, dynamic } = routes;
  if (fixed.has(prepared)) {    
    const handler = fixed.get(prepared)[method];    
    return { handler, args: [] };
  }
  for (const [regexp, value, parsers] of dynamic) {
    if (!regexp.test(prepared)) continue;
    const args = prepared.match(regexp).slice(1);
    const parsed = args.map((arg, i) => parsers[i](arg));
    return { handler: value[method], args: parsed };
  }
  return { handler: null, args: null };
};
