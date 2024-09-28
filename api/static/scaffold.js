'use strict';

const API = 'http://127.0.0.1:8000/';

const VARIABLE = '[variable]';

const sumPath = (...paths) => {
  const clean = [];
  const regexp = new RegExp('^/*|/*$', 'g');
  for (const path of paths) {
    const item = path.replace(regexp, '');
    if (item) clean.push(item);
  }
  return clean.join('/');
}

const scaffold = (structure, previosPath = '') => {
  const api = {};
  for (const [entity, methods] of Object.entries(structure)) {
    if (!Array.isArray(methods)) {
      if (entity === VARIABLE) {
        api.variable = (...args) => {
          const suburl = args.map((arg) => arg.toString()).join('/');
          const path = sumPath(previosPath, suburl);
          const processed = scaffold(methods, path);
          return processed;
        };
        continue;
      }
      const path = sumPath(previosPath, entity);
      const processed = scaffold(methods, path);
      api[entity] = processed;
      continue;
    }
    const functions = {};
    for (const method of methods) {
      functions[method] = async (...args) => {
        const suburl = args.map((arg) => arg.toString()).join('/');
        const path = sumPath(previosPath, entity, suburl);
        const url = new URL(path, API).href;
        const response = await fetch(url);
        return await response.json();
      };
    }
    if (entity === '') Object.assign(api, functions);
    else api[entity] = functions;
  }
  return api;
};

export default scaffold;
