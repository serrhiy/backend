'use strict';

module.exports = (routing) => (url) => {
  const keys = url.split('/');
  let object = routing;
  for (const key of keys) {
    const hasKey = key in object;
    if (!hasKey) return null;
    object = object[key];
  }
  if (typeof object === 'object') {
    if (!('' in object)) return null;
    object = object[''];
  } 
  return object;
};

