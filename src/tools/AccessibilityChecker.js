const runner = require('../lib/runner.js');

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
 * @param {boolean} [logResults=false] Whether or not to log the result to the console
 * @return {Promise} A promise that will resolve once the scan is complete
 */
function run(path, logResults = false) {
  return new Promise((resolve, reject) => {
    results = Object.assign({}, resultDefaults);
    results.time.start = Date.now();

    runner
      .runTests(path)
      .then((testResults) => {
        if (testResults.lastResult.failed > 0) {
          const failedCount = testResults.lastResult.failed;

          results.reports.push(`${failedCount} test${failedCount > 1 ? 's' : ''} failed!`);
          results.time.end = Date.now();

          if (logResults && results.reports.length > 0) {
            console.log(results.reports.join('\n'));
          }

          reject(results);
        } else {
          results.time.end = Date.now();
          resolve(results);
        }
      });
  });
}

module.exports = { run };
