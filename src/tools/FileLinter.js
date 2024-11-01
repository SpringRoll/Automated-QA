const eslint = require('eslint');
const eslintignore = require('../lib/eslintignore.js');
const pad = require('../lib/pad.js');

const resultDefaults = {
  time: {
    start: 0,
    end: 0,
    get duration() {
      return this.end - this.start;
    },
  },
  reports: [],
};
let results;

/**
 * @param {string} path The root path begin the scan in
 * @param {*} configPath A set of options for scanning
 * @param {boolean} [logResults=false] Whether or not to log the result to the console
 * @return {Promise} A promise that will resolve once the scan is complete
 */
async function run(path, configPath, logResults = false) {
  results = Object.assign({}, resultDefaults);
  results.time.start = Date.now();

  const lintConfig = {
    configFile: configPath,
  };

  const cliEngine = new eslint.CLIEngine(lintConfig);

  // resolve the list of files and lint them
  const eslintIgnorePath = eslintignore.findEslintIgnore(path);
  const filesToIgnore = eslintIgnorePath === null ? new Set() : eslintignore.expandEslintIgnore(eslintIgnorePath);
  const filesToLint = eslintignore.expandRootToNonIgnoredFiles(path, filesToIgnore);
  const report = cliEngine.executeOnFiles(filesToLint);


  for (const record of report.results) {
    if (record.errorCount === 0) {
      continue;
    }

    for (const message of record.messages) {
      const lineNumber = pad.left(`${message.line}`, 4, ' ');
      const column = pad.right(`${message.column}`, 4, ' ');
      const rule = pad.left(`${message.ruleId}`, 25, ' ');
      const paddedMessage = pad.left(`${message.message}`, 50, ' ');
      results.reports.push(`${record.filePath} ->${lineNumber}:${column} ${rule} ${paddedMessage}`);
    }
  }

  results.time.end = Date.now();

  if (logResults && results.reports.length > 0) {
    console.log(results.reports.join('\n'));
  }

  if (report.errorCount === 0) {
    return results;
  } else {
    throw results;
  }
}

module.exports = { run };
