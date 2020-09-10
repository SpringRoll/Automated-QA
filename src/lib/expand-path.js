const path = require('path');

/**
 * Expands a path to be absolute, handling the ~ home directory alias
 * @param {string} rawPath The raw path to expand
 * @return {string} An absolute path
 */
const expandPath = (rawPath) => {
  // first, replace any home directory
  const noTilde = rawPath.replace(/~/, process.env.HOME);

  // Now, just resolve the path
  return path.resolve(noTilde);
};

module.exports = expandPath;
