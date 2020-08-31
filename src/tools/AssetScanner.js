const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const imageSize = require('image-size');
const musicMetadata = require('music-metadata');

const { parseSRASConfig } = require('../lib/srasConfig');
const { formatMsToHRT } = require('../lib/format');
const { formatHRTFileSize } = require('../lib/format');
const { isDirectory } = require('../lib/path-validation.js');
const { isPowerOfTwo } = require('../lib/mathHelpers.js');

const fsReadDir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const sizeOf = promisify(imageSize);

const resultDefaults = {
  time: {
    start: 0,
    end: 0,
    get duration() {
      return this.end - this.start;
    },
  },
  files: {
    skipped: 0,
    ignored: 0,
    scanned: 0,
  },
  reports: [],
};

const scannedTypes = {};
const unpermittedTypes = {};
const scanReports = [];

let results;
let scanConfig;

/**
 *
 * @param {*} filePath Path to the file being scanned
 * @param {*} scanRules A set of rules used in the scan
 * @return {Promise} A promise that will resolve once the scan is complete
 */
async function scanJs(filePath, scanRules) {
  try {
    const stat = await fsStat(filePath);
    const maxSize = scanRules.maxSize || Infinity;
    if (maxSize > 0 && stat.size > maxSize) {
      const fileName = path.basename(filePath);
      results.reports.push([
        'JS file size is larger than the recommended file size',
        `[recommended = ${formatHRTFileSize(maxSize)}],`,
        `[${fileName} = ${formatHRTFileSize(stat.size)}]`,
      ].join(' '));
    }
  } catch (err) {
    return Promise.reject(err);
  }
}

/**
 *
 * @param {*} filePath Path to the file being scanned
 * @param {*} scanRules A set of rules used in the scan
 * @return {Promise} A promise that will resolve once the scan is complete
 */
async function scanImage(filePath, scanRules) {
  try {
    const stat = await fsStat(filePath);
    const dimensions = await sizeOf(filePath);

    const maxWidth = scanRules.maxWidth || Infinity;
    const maxHeight = scanRules.maxHeight || Infinity;
    const maxSize = scanRules.maxSize || Infinity;

    const fileName = filePath.split('\\').pop();

    if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
      results.reports.push([
        'Image is larger than the recommended max dimensions',
        `[recommended = ${maxHeight}x${maxHeight}],`,
        `[${fileName} = ${dimensions.width}x${dimensions.height}]`,
      ].join(' '));
    }

    if (!!scanRules.powerOfTwo && (!isPowerOfTwo(dimensions.width) || !isPowerOfTwo(dimensions.height))) {
      results.reports.push([
        'Image dimensions are recommended to be powers of two',
        `[${fileName} = ${dimensions.width}x${dimensions.height}]`,
      ].join(' '));
    }

    if (maxSize > 0 && stat.size > maxSize) {
      results.reports.push([
        'Image file size is larger than the recommended file size',
        `[recommended = ${formatHRTFileSize(maxSize)}],`,
        `[${fileName} = ${formatHRTFileSize(stat.size)}]`,
      ].join(' '));
    }
  } catch (err) {
    return Promise.reject(err);
  }
}

/**
 *
 * @param {*} filePath Path to the file being scanned
 * @param {*} scanRules A set of rules used in the scan
 * @return {Promise} A promise that will resolve once the scan is complete
 */
async function scanAudio(filePath, scanRules) {
  try {
    const stat = await fsStat(filePath);
    const metadata = await musicMetadata.parseFile(filePath);

    const maxSize = scanRules.maxSize || 0;
    const maxChannels = scanRules.maxChannels || 0;
    const sampleRate = scanRules.sampleRate || 0;
    const duration = scanRules.duration || 0;

    const fileName = filePath.split('\\').pop();

    if (maxSize > 0 && stat.size > maxSize) {
      results.reports.push([
        'Audio file size is larger than the recommended file size',
        `[recommended = ${maxSize}],`,
        `[${fileName} = ${formatHRTFileSize(stat.size)}]`,
      ].join(' '));
    }

    if (maxChannels > 0 && metadata.format.numberOfChannels > maxChannels) {
      results.reports.push([
        'Audio file contains more than the recommended number of channels',
        `[recommended = ${maxChannels}],`,
        `[${fileName} = ${metadata.format.numberOfChannels}]`,
      ].join(' '));
    }

    if (sampleRate > 0 && metadata.format.sampleRate !== sampleRate) {
      results.reports.push([
        'Audio sample rate does not match the recommended sample rate',
        `[recommended = ${sampleRate}],`,
        `[${fileName} = ${metadata.format.sampleRate}]`,
      ].join(' '));
    }

    const convertedDuration = metadata.format.duration * 1000; // S to MS
    if (duration > 0 && convertedDuration > duration) {
      results.reports.push([
        'Audio duration is larger than recommended duration',
        `[recommended = ${duration}],`,
        `[${fileName} = ${convertedDuration}]`,
      ].join(' '));
    }
  } catch (err) {
    return Promise.reject(err);
  }
}

/**
 *
 * @param {*} filePath The path to scan
 * @return {Promise} A promise that will resolve once the scan is complete
 */
async function scanDirectory(filePath) {
  if (isDirectory(filePath)) {
    try {
      const files = await fsReadDir(filePath);
      const dirScans = files.map((file) => scanDirectory(path.join(filePath, file)));

      await Promise.all(dirScans);
    } catch (err) {
      return Promise.reject(err);
    }
  } else {
    const ext = path.extname(filePath).slice(1);

    if (scanConfig.ignored.test(ext)) {
      // Track total ignored files.
      results.files.ignored++;
      return;
    } else if (scanConfig.unpermitted.test(ext)) {
      // Track how times we have scanned an this unpermitted file type.
      unpermittedTypes[ext] = (unpermittedTypes[ext] || 0) + 1;
      results.files.skipped++;
      return;
    }

    // Check if there is a rule category for this file extension.
    const hasJsRule = scanConfig.codeRules && scanConfig.codeRules.js && ext === 'js';
    const hasImgRule = !hasJsRule && scanConfig.imgRules[ext] !== undefined;
    const hasAudRule = !hasImgRule && scanConfig.audRules[ext] !== undefined;

    if (hasJsRule) {
      await scanJs(filePath, scanConfig.codeRules.js);
    } else if (hasImgRule) {
      await scanImage(filePath, scanConfig.imgRules[ext]);
    } else if (hasAudRule) {
      await scanAudio(filePath, scanConfig.audRules[ext]);
    } else {
      // Cannot find rules for this file type so it will be skipped.
      // Track total skipped files.
      results.files.skipped++;
      return;
    }

    // Track how many times we have scanned this file type.
    scannedTypes[ext] = (scannedTypes[ext] || 0) + 1;

    // Track total scanned files.
    results.files.scanned++;
  }
}

/**
 *
 * @param {string} path The root path begin the scan in
 * @param {*} options A set of options for scanning
 * @param {boolean} [logResults=true] Whether or not to log the result to the console
 * @return {Promise} A promise that will resolve once the scan is complete
 */
function scan(path, options, logResults = false) {
  return new Promise((resolve, reject) => {
    scanConfig = parseSRASConfig(options);

    results = Object.assign({}, resultDefaults);
    results.time.start = Date.now();

    results.reports.push(`Scanning assets at [path = ${path}]`);

    scanDirectory(path).then(() => {
      results.time.end = Date.now();

      const counts = [];
      const unpermittedReports = [];
      const missingRequiredReports = [];

      Object.keys(scannedTypes).forEach((i) => counts.push(`${scannedTypes[i]} ${i}(s)`));
      Object.keys(unpermittedTypes).forEach((i) => unpermittedReports.push(
        `Detected ${unpermittedTypes[i]} unpermitted file type(s) [type = ${i}]`,
      ));

      scanConfig.requiredTypes.forEach((type) => {
        if (scannedTypes[type] === undefined) {
          missingRequiredReports.push(`Could not find file types matching [type = ${type}]`);
        }
      });

      if (scanReports.length > 0) {
        results.reports = results.reports.concat(scanReports);
      }
      if (unpermittedReports.length > 0) {
        results.reports = results.reports.concat(unpermittedReports);
      }
      if (missingRequiredReports.length > 0) {
        results.reports = results.reports.concat(missingRequiredReports);
      }
      if (counts.length > 0) {
        results.reports.push(`Scanned ${counts.join(', ')}`);
      }

      results.reports.push(
        [
          `Scan complete [time = ${formatMsToHRT(results.time.duration)}]:`,
          `${results.files.scanned} file(s) scanned,`,
          `${results.files.skipped} file(s) skipped,`,
          `${results.files.ignored} file(s) ignored`,
        ].join(' '),
      );

      if (logResults && results.reports.length > 0) {
        console.log(results.reports.join('\n'));
      }

      resolve(results);
    }).catch((err) => reject(err));
  });
}

module.exports = { scan };
