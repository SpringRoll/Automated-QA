const fs = require('fs');
const path = require('path');

const expandPath = require('./expand-path.js');

const validateGamePath = (providedPath) => {
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

module.exports = validateGamePath;
