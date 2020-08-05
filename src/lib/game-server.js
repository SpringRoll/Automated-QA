const express = require('express');

const expandPath = require('./expand-path.js');
const { GAME_SERVER_PORT } = require('./constants.js');

let app;
let server;

/**
 * Starts an express server with the server root pointing at rawPath
 * @param {string} rawPath The raw path to start the server on
 * @return {Promise} A promise that resolves once the server is up and running
 */
const start = async (rawPath) => {
  app = express();
  app.use(express.static(expandPath(rawPath)));

  return new Promise((resolve) => {
    server = app.listen(GAME_SERVER_PORT, resolve);
  });
};

/**
 * Stops the running express server, if it's up.
 * @return {void}
 */
const stop = () => {
  if (server) {
    server.close();
  }
};

module.exports = { start, stop };
