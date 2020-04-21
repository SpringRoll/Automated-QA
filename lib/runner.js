const karma = require('karma');
const path = require('path');

const gameServer = require('./game-server.js');

const sleep = (millis) => {
  return new Promise((resolve) => setTimeout(resolve, millis));
};

const buildKarmaServer = () => {
  const karmaConfig = karma.config.parseConfig(path.resolve(__dirname, '../karma.conf.js'));

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

const runTests = async (gamePath) => {
  console.log('Starting game server...');
  await gameServer.start(gamePath);

  console.log('Building server');
  const server = buildKarmaServer();

  console.log('Starting server');
  await server.start();
  await waitForServerReady(server);
  const runResults = await waitForRunCompletion(server);

  console.log('RUN RESULTS:', runResults.browsers[0].lastResult);
  await server.stop();

  console.log('Stopping game server');
  gameServer.stop();
};

module.exports = { runTests };
