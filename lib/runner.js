const karma = require('karma');
const path = require('path');

const gameServer = require('./game-server.js');

const buildKarmaServer = () => {
  const karmaConfig = karma.config.parseConfig(path.resolve(__dirname, '../karma.conf.js'));

  return new karma.Server(karmaConfig, (exitCode) => {
    console.error(`Karma server exited with code ${exitCode}`);
    process.exit(exitCode);
  });
};

const runTests = async (gamePath) => {
  console.log('Starting game server...');
  await gameServer.start(gamePath);

  console.log('Building server');
  const server = buildKarmaServer();

  console.log('Starting server');
  await server.start();

  console.log('Adding listener');
  server.on('run_complete', function() {
    console.log('HYA!', arguments);
  });

  console.log('Stopping game server');
  gameServer.stop();
};

module.exports = { runTests };
