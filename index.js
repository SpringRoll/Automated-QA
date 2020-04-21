#!/usr/bin/env node

const packageJson = require('./package.json');
const { program } = require('commander');

const validateGamePath = require('./lib/validate-game-path.js');
const runner = require('./lib/runner.js');

program.version(packageJson.version);
program
  .requiredOption('-s, --slug <slug>', 'The game slug to use when reporting test results')
  .requiredOption('-p, --path <path>', 'The path to the deploy folder of the game');

program.parse(process.argv);

validateGamePath(program.path);

console.log('About to run tests');
runner
  .runTests(program.path)
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
