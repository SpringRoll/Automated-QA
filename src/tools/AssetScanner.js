const path = require('path');
const fs = require('fs');
const promisify = require('util').promisify;
const imageSize = require('image-size');
const musicMetadata = require('music-metadata');
const { execSync } = require('child_process');

const { parseSRASConfig } = require('../lib/srasConfig');
const { formatMsToHRT } = require('../lib/format');
const { formatHRTFileSize } = require('../lib/format');
const { isDirectory } = require('../lib/path-validation.js');
const { isPowerOfTwo } = require('../lib/mathHelpers.js');
const ffmpegPath = require('ffmpeg-static');

const fsReadDir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);
const sizeOf = promisify(imageSize);

// import { LoudnessMeter } from '@domchristie/needles'

/**
 *
 * @class AssetScanner
 */
class AssetScanner {
  constructor() {
    this.scannedTypes = {};
    this.unpermittedTypes = {};
    this.scanReports = [];

    this.results = {
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
  }

  /**
   *
   * @param {*} filePath Path to the file being scanned
   * @param {*} scanRules A set of rules used in the scan
   * @return {Promise} A promise that will resolve once the scan is complete
   */
  async scanJs(filePath, scanRules) {
    try {
      const stat = await fsStat(filePath);
      const maxSize = scanRules.maxSize || Infinity;
      if (maxSize > 0 && stat.size > maxSize) {
        const fileName = path.basename(filePath);
        this.results.reports.push([
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
  async scanImage(filePath, scanRules) {
    try {
      const stat = await fsStat(filePath);
      const dimensions = await sizeOf(filePath);

      const maxWidth = scanRules.maxWidth || Infinity;
      const maxHeight = scanRules.maxHeight || Infinity;
      const maxSize = scanRules.maxSize || Infinity;

      const fileName = filePath.split('\\').pop();

      if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
        this.results.reports.push([
          'Image is larger than the recommended max dimensions',
          `[recommended = ${maxHeight}x${maxHeight}],`,
          `[${fileName} = ${dimensions.width}x${dimensions.height}]`,
        ].join(' '));
      }

      if (!!scanRules.powerOfTwo && (!isPowerOfTwo(dimensions.width) || !isPowerOfTwo(dimensions.height))) {
        this.results.reports.push([
          'Image dimensions are recommended to be powers of two',
          `[${fileName} = ${dimensions.width}x${dimensions.height}]`,
        ].join(' '));
      }

      if (maxSize > 0 && stat.size > maxSize) {
        this.results.reports.push([
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
  async scanAudio(filePath, scanRules) {
    try {
      const stat = await fsStat(filePath);
      const metadata = await musicMetadata.parseFile(filePath);

      const maxSize = scanRules.maxSize || 0;
      const maxChannels = scanRules.maxChannels || 0;
      const sampleRate = scanRules.sampleRate || 0;
      const duration = scanRules.duration || 0;
      const maxLoudness = scanRules.maxLoudness || 0;

      const fileName = filePath.split('\\').pop();

      // The command to be passed to ffmpeg. 
      let ffmpegCommand = ffmpegPath + ` -i ${filePath} -af loudnorm=I=-16:dual_mono=true:TP=-1.5:LRA=11:print_format=summary -f null - 2>&1`;
      
      let ffmpegOutputt = execSync(ffmpegCommand, {
        encoding: 'utf8',
        stdio: "pipe"
      });
      
      // Use regex to get find the Input Integrated value and get the LUFS value. Parse the value as an Integer. Can output -Inf LUFS which will parse as NaN
      let fileLoudness = parseInt(ffmpegOutputt.match(/(?<=Input Integrated:)(.*)(?=LUFS)/)[0]);
      
      
      if (maxLoudness < 0 && fileLoudness < maxLoudness) {
        this.results.reports.push([
          'Audio file is louder than the recommended loudness',
          `[recommended = ${maxLoudness} LUFS],`,
          `[${fileName} = ${fileLoudness} LUFS]`,
        ].join(' '));
      }

      if (maxSize > 0 && stat.size > maxSize) {
        this.results.reports.push([
          'Audio file size is larger than the recommended file size',
          `[recommended = ${maxSize}],`,
          `[${fileName} = ${formatHRTFileSize(stat.size)}]`,
        ].join(' '));
      }

      if (maxChannels > 0 && metadata.format.numberOfChannels > maxChannels) {
        this.results.reports.push([
          'Audio file contains more than the recommended number of channels',
          `[recommended = ${maxChannels}],`,
          `[${fileName} = ${metadata.format.numberOfChannels}]`,
        ].join(' '));
      }

      if (sampleRate > 0 && metadata.format.sampleRate !== sampleRate) {
        this.results.reports.push([
          'Audio sample rate does not match the recommended sample rate',
          `[recommended = ${sampleRate}],`,
          `[${fileName} = ${metadata.format.sampleRate}]`,
        ].join(' '));
      }

      const convertedDuration = metadata.format.duration * 1000; // S to MS
      if (duration > 0 && convertedDuration > duration) {
        this.results.reports.push([
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
  async scanDirectory(filePath) {
    if (isDirectory(filePath)) {
      try {
        const files = await fsReadDir(filePath);
        const dirScans = files.map((file) => this.scanDirectory(path.join(filePath, file)));

        await Promise.all(dirScans);
      } catch (err) {
        return Promise.reject(err);
      }
    } else {
      const ext = path.extname(filePath).slice(1);

      if (this.scanConfig.ignored.test(ext)) {
        // Track total ignored files.
        this.results.files.ignored++;
        return;
      } else if (this.scanConfig.unpermitted.test(ext)) {
        // Track how times we have scanned an this unpermitted file type.
        this.unpermittedTypes[ext] = (this.unpermittedTypes[ext] || 0) + 1;
        this.results.files.skipped++;
        return;
      }

      // Check if there is a rule category for this file extension.
      const hasJsRule = this.scanConfig.codeRules && this.scanConfig.codeRules.js && ext === 'js';
      const hasImgRule = !hasJsRule && this.scanConfig.imgRules[ext] !== undefined;
      const hasAudRule = !hasImgRule && this.scanConfig.audRules[ext] !== undefined;

      if (hasJsRule) {
        await this.scanJs(filePath, this.scanConfig.codeRules.js);
      } else if (hasImgRule) {
        await this.scanImage(filePath, this.scanConfig.imgRules[ext]);
      } else if (hasAudRule) {
        await this.scanAudio(filePath, this.scanConfig.audRules[ext]);
      } else {
        // Cannot find rules for this file type so it will be skipped.
        // Track total skipped files.
        this.results.files.skipped++;
        return;
      }

      // Track how many times we have scanned this file type.
      this.scannedTypes[ext] = (this.scannedTypes[ext] || 0) + 1;

      // Track total scanned files.
      this.results.files.scanned++;
    }
  }

  /**
   * @param {string} path The root path begin the scan in
   * @param {*} options A set of options for scanning
   * @param {boolean} [logResults=false] Whether or not to log the result to the console
   * @return {Promise} A promise that will resolve once the scan is complete
   */
  scan(path, options, logResults = false) {
    this.scanConfig = parseSRASConfig(options);

    return new Promise((resolve, reject) => {
      this.scanConfig = parseSRASConfig(options);

      this.results.time.start = Date.now();
      this.results.reports.push(`Scanning assets at [path = ${path}]`);

      this.scanDirectory(path).then(() => {
        this.results.time.end = Date.now();

        const counts = [];
        const unpermittedReports = [];
        const missingRequiredReports = [];

        Object.keys(this.scannedTypes).forEach((i) => counts.push(`${this.scannedTypes[i]} ${i}(s)`));
        Object.keys(this.unpermittedTypes).forEach((i) => unpermittedReports.push(
          `Detected ${this.unpermittedTypes[i]} unpermitted file type(s) [type = ${i}]`,
        ));

        this.scanConfig.requiredTypes.forEach((type) => {
          if (this.scannedTypes[type] === undefined) {
            missingRequiredReports.push(`Could not find file types matching [type = ${type}]`);
          }
        });

        if (this.scanReports.length > 0) {
          this.results.reports = this.results.reports.concat(this.scanReports);
        }
        if (unpermittedReports.length > 0) {
          this.results.reports = this.results.reports.concat(unpermittedReports);
        }
        if (missingRequiredReports.length > 0) {
          this.results.reports = this.results.reports.concat(missingRequiredReports);
        }
        if (counts.length > 0) {
          this.results.reports.push(`Scanned ${counts.join(', ')}`);
        }

        this.results.reports.push(
          [
            `Scan complete [time = ${formatMsToHRT(this.results.time.duration)}]:`,
            `${this.results.files.scanned} file(s) scanned,`,
            `${this.results.files.skipped} file(s) skipped,`,
            `${this.results.files.ignored} file(s) ignored`,
          ].join(' '),
        );

        if (logResults && this.results.reports.length > 0) {
          console.log(this.results.reports.join('\n'));
        }

        resolve(this.results);
      }).catch((err) => reject(err));
    });
  }
}

/**
 * @param {string} path The root path begin the scan in
 * @param {*} options A set of options for scanning
 * @param {boolean} [logResults=false] Whether or not to log the result to the console
 * @return {Promise} A promise that will resolve once the scan is complete
 */
function run(path, options, logResults = false) {
  const scanner = new AssetScanner();
  return scanner.scan(path, options, logResults);
}

module.exports = { run };
