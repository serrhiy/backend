'use strict';

const fs = require('node:fs');
const path = require('node:path');

const createKey = (filepath) => {
  const { dir, name } = path.parse(filepath);
  const indexed = name === 'index' ? '' : name;
  const url = path.join(dir, indexed);
  return url === '.' ? '' : url;
};

const routes = async (root, route = new Map(), parent = '') => {
  const files = await fs.promises.readdir(root, { withFileTypes: true });
  for (const file of files) {
    const filename = file.name;
    const relative = path.join(parent, filename);
    const fullPath = path.join(root, filename);
    if (file.isDirectory()) {
      await routes(fullPath, route, relative);
      continue;
    }
    const extention = path.extname(relative);
    const key = extention === '.html' ? createKey(relative) : relative;
    route.set(key, fullPath);
  }
  return route;
};

module.exports = routes;
