'use strict';

const fs = require('node:fs');

(async () => {
  try {
    const content = await fs.promises.readFile('example.txt'); 
    console.log({ content });
  } catch (error) {
    console.log(error.message);
  }
})();

// const { setTimeout } = require('node:timers');

// const sleepReject = (msec, error) => new Promise((resolve, reject) => {
//   setTimeout(reject, msec, error);
// });

// (async () => {
//   try {
//     const first = await Promise.reject(new Error('First Error'));
//   } catch (error) {
//     console.log(error);
    
//   }
// })();
// Promise.reject(new Error('First Error'))
//   .catch(() => sleepReject(3000, new Error('Second Error')))
//   .catch(() => sleepReject(2000, new Error('Third Error')))
//   .catch(() => {});
