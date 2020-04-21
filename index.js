#!/usr/bin/env node

const packageJson = require('./package.json');
const { program } = require('commander');

const validateGamePath = require('./lib/validate-game-path.js');
const gameServer = require('./lib/game-server.js');

program.version(packageJson.version);
program
  .requiredOption('-s, --slug <slug>', 'The game slug to use when reporting test results')
  .requiredOption('-p, --path <path>', 'The path to the deploy folder of the game');

program.parse(process.argv);

validateGamePath(program.path);

console.log('Starting game server...');
gameServer.start(program.path).then(() => {
  const duration = 10000;
  console.log(`Server up for ${duration}ms...`);
  setTimeout(() => {
    gameServer.stop();
  }, duration);
});
