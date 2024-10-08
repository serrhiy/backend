'use strict';

// File contains a small piece of the source to demonstrate main module
// of a sample application to be executed in the sandboxed context by
// another pice of code from `framework.js`. Read README.md for tasks.

// Print from the global context of application module
(async () => {
  await setTimeout(5000);
  console.log('From application global context');
})();

module.exports = () => {
  // Print from the exported function context
  console.log('From application exported function');
};
