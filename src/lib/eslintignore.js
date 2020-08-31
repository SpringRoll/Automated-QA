const expandPath = require('./expand-path');
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const { isFile } = require('./path-validation.js');

/**
 * Crawls upward from a path, looking for an .eslintignore file
 * @param {string} startingPath The path to start from
 * @return {string|null} An absolute path to an eslintignore file, or null if nothing was found
 */
const findEslintIgnore = (startingPath) => {
  let currentDirectory = expandPath(startingPath);

  while (currentDirectory !== '/') {
    const eslintIgnorePath = path.join(currentDirectory, '.eslintignore');

    // if this file exists, we found it
    if (isFile(eslintIgnorePath)) {
      return eslintIgnorePath;
    }

    if (currentDirectory === path.dirname(currentDirectory)) {
      return null;
    }

    // Go back a directory and look there
    currentDirectory = path.dirname(currentDirectory);
  }

  return null;
};

/**
 * Expands the contents of an eslintignore file into an array of absolute paths that should be ignored
 * @param {string} eslintIgnorePath The path to the eslint ignore
 * @return {Set<string>} An set of absolute paths to files that are ignored by the passed eslintignore file
 */
const expandEslintIgnore = (eslintIgnorePath) => {
  const ignoreRoot = path.dirname(eslintIgnorePath);

  // convert the globs from the eslintignore file into absolute paths
  const eslintIgnoreRawContents = fs.readFileSync(eslintIgnorePath, 'utf8').trim().split('\n');
  const eslintIgnoreAbsoluteGlobs = eslintIgnoreRawContents.map((entry) => path.join(ignoreRoot, entry));

  // convert the globs into full paths and add them to a set
  const paths = new Set();
  eslintIgnoreAbsoluteGlobs.forEach((singlePath) => {
    glob.sync(singlePath).forEach((resolvedPath) => paths.add(resolvedPath));
  });

  return paths;
};

/**
 * Expands the root folder for ESLint to a list of absolute paths of TypeScript and JavaScript in that foder
 * @param {string} root The root to begin searching from files from
 * @return {string[]} An array of absolute paths to TypeScript and JavaScript files in that directory
 */
const expandRootToLintableFiles = (root) => {
  const rootAsAbsolute = expandPath(root);
  return glob.sync(path.join(rootAsAbsolute, '**', '*.{js,ts}'));
};

/**
 * Expands a root directory to a list of absolute paths to lintable files, skipping ones that are ignored in the set
 * provided.
 * @param {string} root The root path to find files from
 * @param {Set<string>} ignoredFiles A set containing absolute paths to files to ignore
 * @return {string[]} An array of absolute paths of lintable files within root that are not ignored
 */
const expandRootToNonIgnoredFiles = (root, ignoredFiles) => {
  return expandRootToLintableFiles(root).filter((lintableFile) => !ignoredFiles.has(lintableFile));
};

module.exports = { findEslintIgnore, expandEslintIgnore, expandRootToLintableFiles, expandRootToNonIgnoredFiles };
