const express = require('express');

const expandPath = require('./expand-path.js');
const { GAME_SERVER_PORT } = require('./constants.js');

let app;
let server;

const start = async (fullPath) => {
  app = express();
  app.use(express.static(fullPath));

  return new Promise((resolve) => {
    server = app.listen(GAME_SERVER_PORT, resolve);
  });
};

const stop = () => {
  if (server) {
    server.close();
  }
};

module.exports = { start, stop };
