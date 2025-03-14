# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.1] - 2025-03-13

- Switch error count check in FileLinter.js to properly check for any error reports

## [2.2.0] - 2024-10-16
- Linter now errors on loose equalities, var for variable definition, and for...of loops [ticket](https://www.pivotaltracker.com/story/show/188211631)

- Updated to work with Node 20 [ticket](https://www.pivotaltracker.com/story/show/188228334)

- Updated MIT liscence text [ticket](https://www.pivotaltracker.com/story/show/188078323)

## [2.1.1] - 2024-05-03

### Changed
- Bumped dependencies recommended by dependabot in the package-lock.json

## [2.1.0] - 2024-03-07

### Changed

- bumped nvmrc to 18.19.1 [ticket](https://www.pivotaltracker.com/story/show/186235180)

### Added

- Node 18 support


## [2.0.0] - 2023-02-21

### Changed

- bumped nvmrc to 16.17.1

### Added

- Added node 16 support

### Removed

 - Removed node Node <12 support 

 ## [1.3.0] - 2022-02-15

### Added

- Audio Bitrate check
- Added new comment syntax rules to eslint rules

## [1.2.1] - 2021-09-15

### Fixed

- update scanAudio so that file names with spaces don't break the scan
- update version of `music-metadata` to fix an error when scanning some files. explanation [here](https://github.com/Borewit/music-metadata/issues/856)


## [1.2.0] - 2021-01-29

### Added

- loudness check for audio files

## [1.1.0] - 2020-09-10
### Added

- node require support

## [1.0.3] - 2020-09-10

### Changed

- Tiny README Tweaks

## [1.0.2] - 2020-09-10

### Changed

- Picked final package name
- Enabled automatic release publishing

## [1.0.1] - 2020-07-28

### Fixed

- Passing asset scans return with a 0 status code now.

### Changed

- MP3 files are not required anymore

## [1.0.0] - 2020-07-24

### Added

- SpringRoll accessibility checker utility which uses [karma](https://karma-runner.github.io/4.0/index.html)
  for in-browser checking
- SpringRoll linter utility which uses [eslint](https://eslint.org/) to perform automated style-checking
- SpringRoll asset checker utility which enables quality control checks for assets in a SpringRoll game.
