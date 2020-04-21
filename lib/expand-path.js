const path = require('path');

const expandPath = (rawPath) => {
  // first, replace any home directory
  const noTilde = rawPath.replace(/~/, process.env.HOME);

  // Now, just resolve the path
  return path.resolve(noTilde);
};

module.exports = expandPath;
