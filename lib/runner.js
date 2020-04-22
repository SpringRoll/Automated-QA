const karma = require('karma');
const path = require('path');

const gameServer = require('./game-server.js');

const buildKarmaServer = () => {
  const karmaConfig = karma.config.parseConfig(path.resolve(__dirname, '../config/karma.conf.js'));

  return new karma.Server(karmaConfig, (exitCode) => {
    console.error(`Karma server exited with code ${exitCode}`);
  });
};

const waitForServerReady = (server) => {
  return new Promise((resolve) => server.once('listening', resolve));
};

const waitForRunCompletion = (server) => {
  return new Promise((resolve) => server.once('run_complete', resolve));
};

const stopServer = async () => {
  return new Promise((resolve, reject) => {
    karma.stopper.stop({}, (exitCode) => {
      if (exitCode === 0) {
        resolve();
      } else {
        reject(new Error(`Karma exited with exit code ${exitCode}`));
      }
    });
  });
};

const runTests = async (gamePath) => {
  await gameServer.start(gamePath);

  const server = buildKarmaServer();

  await server.start();
  await waitForServerReady(server);
  const runResults = await waitForRunCompletion(server);
  await stopServer();

  gameServer.stop();

  return runResults.browsers[0];
};

module.exports = { runTests };
