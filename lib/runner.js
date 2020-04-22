const karma = require('karma');
const path = require('path');

const gameServer = require('./game-server.js');

/**
 * Builds a karam server instance, using the karma config file stored in ./config
 * @return {karma.Server} The created server instance
 */
const buildKarmaServer = () => {
  const karmaConfig = karma.config.parseConfig(path.resolve(__dirname, '../config/karma.conf.js'));

  return new karma.Server(karmaConfig, (exitCode) => {
    console.error(`Karma server exited with code ${exitCode}`);
  });
};

/**
 * Waits for the passed karma server to be ready
 * @param {karma.Server} server The server to wait on
 * @return {Promise} A promise that resolves once the karma server is up and running
 */
const waitForServerReady = (server) => {
  return new Promise((resolve) => server.once('listening', resolve));
};

/**
 * Waits for the passed karma server to finish a test run
 * @param {karma.Server} server The server to wait on
 * @return {Promise<Object>} A promise that resolves to test run results once the karma server has finished a test run
 */
const waitForRunCompletion = (server) => {
  return new Promise((resolve) => server.once('run_complete', resolve));
};

/**
 * Stops any running karma test servers
 * @return {Promise} A promise that resolves once the server has stopped
 */
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

/**
 * Stands up a test server for the game, and runs karma tests against it
 * @param {string} gamePath The path to the game to test
 * @return {Promise<Object>} A promise that resolves to the test run results after tests have completed
 */
const runTests = async (gamePath) => {
  // serve up the game
  await gameServer.start(path.join(gamePath, 'deploy'));

  // start up the karma test server
  const server = buildKarmaServer();
  await server.start();
  await waitForServerReady(server);

  // wait for the initial test run to complete
  const runResults = await waitForRunCompletion(server);

  // stop all of the server's we've spun up
  await stopServer();
  gameServer.stop();

  // send the results back
  return runResults.browsers[0];
};

module.exports = { runTests };
