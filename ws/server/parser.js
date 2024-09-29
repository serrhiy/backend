'use strict';

const getContentLength = (frame) => frame.readUInt8(1) & 127;

const masks = {
  '126': (frame) => frame.subarray(4, 8),
  '127': (frame) => frame.subarray(10, 14),
  default: (frame) => frame.subarray(2, 6),
};

const data = {
  '126': (frame) => frame.subarray(8, frame.length),
  '127': (frame) => frame.subarray(14, frame.length),
  default: (frame) => frame.subarray(6, frame.length),
};

module.exports = (frame) => {
  const length = getContentLength(frame);
  const mask = length in masks ? masks[length] : masks['default'];
  const content = length in data ? data[length] : data['default'];
  return { mask: mask(frame), content: content(frame) };
};