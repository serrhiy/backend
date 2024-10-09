'use strict';

const getLength = (chunk) => {
  const length = chunk.readUInt8(1) & 127;
  if (length <= 125) return length;
  if (length === 126) return chunk.readUInt16BE(2);
  return chunk.readBigUInt64BE(2);
};

const getMask = (chunk) => {
  const length = chunk.readUInt8(1) & 127;
  if (length <= 125) return chunk.subarray(2, 6);
  if (length === 126) return chunk.subarray(4, 8);
  return chunk.subarray(10, 14);
};

const getContent = (chunk) => {
  const length = chunk.readUInt8(1) & 127;
  if (length <= 125) return chunk.subarray(6);
  if (length === 126) return chunk.subarray(8);
  return chunk.subarray(14);
};

module.exports = {
  getLength,
  getMask,
  getContent,
};
