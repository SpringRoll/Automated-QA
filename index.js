#!/usr/bin/env node

const fs = require('fs');
const packageJson = require('./package.json');
const path = require('path');
const { program } = require('commander');

const gameServer = require('./lib/game-server.js');

const expandPath = (rawPath) => {
  // first, replace any home directory
  const noTilde = rawPath.replace(/~/, process.env.HOME);

  // Now, just resolve the path
  return path.resolve(noTilde);
};

const validatePath = (providedPath) => {
  const fullGamePath = expandPath(providedPath);
  const indexHtmlPath = path.join(fullGamePath, 'index.html');

  if (!fs.existsSync(fullGamePath)) {
    console.error(`The path ${providedPath} (resolved to ${fullGamePath}) was not found`);
  } else if (!fs.statSync(fullGamePath).isDirectory()) {
    console.error(`The path ${providedPath} (resolved to ${fullGamePath}) is not a directory`);
  } else if (!fs.existsSync(indexHtmlPath) || !fs.statSync(indexHtmlPath).isFile()) {
    console.error(`The path ${providedPath} (resolved to ${fullGamePath}) did not contain an index.html`);
  } else {
    console.log(`${providedPath} valid`);
  }
};

program.version(packageJson.version);
program
  .requiredOption('-s, --slug <slug>', 'The game slug to use when reporting test results')
  .requiredOption('-p, --path <path>', 'The path to the deploy folder of the game');

program.parse(process.argv);

validatePath(program.path);

console.log('Starting game server...');
gameServer.start(expandPath(program.path)).then(() => {
  const duration = 10000;
  console.log(`Server up for ${duration}ms...`);
  setTimeout(() => {
    gameServer.stop();
  }, duration);
});
