const fs = require('fs');
const path = require('path');

const expandPath = require('./expand-path.js');

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

module.exports = { isDirectory, isFile };
