'use strict';

const DATETIME_LENGTH = 19;
const ERROR_MESSAGE = 'Error';

const logString = (message) => {
  const now = new Date().toISOString();
  const date = now.substring(0, DATETIME_LENGTH);
  const line = date + '\t' + message;
  return line.replace(/[\n\r]\s*/g, '; ') + '\n';
};

module.exports = (stream) => class extends Promise {
  constructor(executor) {
    super(executor);
  }

  catch(onRejected) {
    return super.catch((error) => {
      const message = error ? error.toString() : ERROR_MESSAGE;
      const logstring = logString(message);
      stream.write(logstring);
      return onRejected(error);
    });
  }
};
