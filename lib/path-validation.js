const fs = require('fs');
const path = require('path');

const expandPath = require('./expand-path.js');

const exists = (providedPath) => {
  const fullPath = expandPath(providedPath);
  return fs.existsSync(fullPath);
};

const isDirectory = (providedPath) => {
  const fullPath = expandPath(providedPath);
  if (!fs.existsSync(fullPath)) {
    return false;
  }

  return fs.statSync(fullPath).isDirectory();
};

const isFile = (providedPath) => {
  const fullPath = expandPath(providedPath);
  if (!fs.existsSync(fullPath)) {
    return false;
  }

  return fs.statSync(fullPath).isFile();
};

const hasDeployFolder = (providedPath) => {
  const gameDirectory = expandPath(providedPath);
  if (!isDirectory(gameDirectory)) {
    return false;
  }

  const deployPath = path.join(gameDirectory, 'deploy');
  return isDirectory(deployPath);
};

const hasSrcFolder = (providedPath) => {
  const gameDirectory = expandPath(providedPath);
  if (!isDirectory(gameDirectory)) {
    return false;
  }

  const srcPath = path.join(gameDirectory, 'src');
  return isDirectory(srcPath);
};

module.exports = { exists, isDirectory, isFile, hasDeployFolder, hasSrcFolder };
