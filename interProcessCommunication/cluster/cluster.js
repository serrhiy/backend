'use strict';

const cluster = require('node:cluster');

const source = cluster.isMaster ? './master.js' : './application.js';
require(source);
