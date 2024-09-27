'use strict';

const fsp = require('node:fs/promises');
const path = require('node:path');

const extractTokens = (string) => {
  const firstArgIndex = string.indexOf('[');
  if (firstArgIndex === -1) return [string];
  const base = string.slice(0, firstArgIndex);
  const argsString = string.slice(firstArgIndex);
  let lastIndex = 0;
  const args = [base];
  while (true) {
    const start = argsString.indexOf('[', lastIndex);
    if (start === -1) return args;
    const end = argsString.indexOf(']', start) + 1;
    const argument = argsString.slice(start, end);
    args.push(argument);
    lastIndex = end;
  }
};

const createUrl = (filepath) => {
  const { dir, name } = path.parse(filepath);
  const indexed = name === 'index' ? '' : name;
  const tokens = extractTokens(indexed);
  const url = path.join(dir, ...tokens);
  return url === '.' ? '' : url;
};

const routing = async (apiPath, load, routes, parentType, root) => {
  const files = await fsp.readdir(apiPath, { withFileTypes: true });
  for (const file of files) {
    const filename = file.name;
    const subpath = path.join(apiPath, filename);
    const relative = path.join(root, filename);
    const isDyn = filename.includes('[') || parentType === routes.dynamic;
    const type = isDyn ? routes.dynamic : routes.fixed;
    if (file.isDirectory()) {
      await routing(subpath, load, routes, type, relative);
      continue;
    }
    const exported = await load(subpath);
    type.set(createUrl(relative), exported);
  }
  return routes;
};

const regexRoutes = (routes, tokens) => {
  const { fixed, dynamic } = routes;
  const result = new Set();
  const types = Object.entries(tokens);
  for (const [key, value] of dynamic) {
    const tokens = [];
    const parsers = [];
    for (const token of key.split('/')) {
      if (!token.startsWith('[')) {
        tokens.push(token);
        continue;
      }
      for (const [name, parser] of types) {
        if (token !== '[' + name + ']') continue;
        tokens.push(parser.regexp);
        parsers.push(parser.parser);
      }
    }
    const regexp = new RegExp('^' + tokens.join('/') + '$');
    result.add([regexp, value, parsers]);
  }
  return { fixed, dynamic: result };
};

module.exports = async (apiPath, load, tokens) => {
  const routes = { fixed: new Map(), dynamic: new Map() };
  const simple = await routing(apiPath, load, routes, routes.fixed, '');
  return regexRoutes(simple, tokens);
};
