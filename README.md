# SpringRoll Checker
This module provides a suite of tools for performing automated QA checks on SpringRoll games.

The tools currently consist of the following utilities:
- `srac` - An [karma](https://karma-runner.github.io) test suite runner for checking accessibility in SpringRoll games.
- `srlint` - An [eslint](https://eslint.org) style-checker for games.
- `sras` - An asset scanner that will check assets within a game's deployment folder.

## Glossary
- [SpringRoll](https://github.com/SpringRoll/SpringRoll) - a JavaScript framework for making accessible HTML5 games
- [Jenkins](https://jenkins.io/) - a open source build server.
- [Karma](https://karma-runner.github.io/4.0/index.html) - a browser automation tool for running unit tests
- [Mocha](https://mochajs.org/) - a JavaScript testing framework
- [Chai](https://www.chaijs.com/) - a JavaScript assertion library
- [Bellhop](https://github.com/SpringRoll/Bellhop) - a JavaScript library used by SpringRoll to faciliate communication
  between an iframe and it's parent using the [`postMessage` API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- Features - A JSON blob that SpringRoll games emit at startup to determine which accessibility features they support.
  For example, a game may contain muteable `vo` and `sfx` but not have any `music`.

## Getting Started
The only external dependency of this library is [Firefox](https://www.mozilla.org/en-US/firefox/) which is ran
[headless](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Headless_mode) during a test suite run.

Lastly, you'll need `node` installed (version 10 is preferrable) and `npm`. You then install this via:
```
npm i springroll-automated-qa
```

After installation two commands should be available to you via `npx`:
```
npx srac
npx srlint
npx sras
```

### Accessibility Checking
A typical accessibility check would look like this:
```
npx srac -p path/to/the/game/deploy
```

This will start a test server in `path/to/the/game/deploy` and a headless Firefox runner to check for a handful of game
features to be present.
Note that an optional `-c` option can be provided to set the status code upon error.
For instance:

```
npx srac -p path/to/the/game/deploy -c 123
```

will make the accessibility checker fail with status code 123 if the test suite fails.

### Linting Pass
A typical linting pass would look like this:
```
npx srlint -p path/to/the/game
```

This will start at the root of the passed directory, and crawl it looking for non-asset JavaScript and TypeScript files.

Note that an optional `-c` option can be provided to set the status code upon error.
For instance:

```
npx srlint -p path/to/the/game/src/ -c 123
```

will make the linter fail with status code 123 if a code style issue is found.

### Asset Scanner
A typical asset scanning pass would look like this:
```
npx sras -p path/to/the/deploy/folder --config path/to/scan/rules/config
```
This script should be ran as a post build process and the path provided should be the root of the deploy folder of the game.

Note: You must provide the scanner with a valid JSON `--config` file that outlines the rules for specific file types. If a file type is missing from the config, then the file will be ignored during the scan.

For an example of a config file see `./config/srasConfig.json`.

Note that an optional -c option can be provided to set the status code upon error. For instance:
```
npx sras -p path/to/the/deploy/folder --config path/to/scan/rules/config -c 123
```
will make the linter fail with status code 123 if a code style issue is found.

## Project Structure
The project contains the following directories:

- `bin` which contains the two main entrypoint executables that this module provides (`srac` and `srlint`)
- `config` which contains configuration files for karma and eslint.
- `lib` which contains various utility functions used throughout the project.
- `tests` which contains the test suite used on games

## Requirements
As mentioned earlier, the only external dependency of this utility is Firefox for headless browser testing.

## Running Locally
The `bin` folder contains all executables that you would need to run locally.
After running `npm ci` the following commands should be executable:
- `./bin/srac`
- `./bin/srlint`
- `./bin/sras`

## Test Suite
There is no test suite, but there are lint scripts available via `npm run lint`

## Gotchas
The main runner for tests `lib/runner.js` spawns two processes:
- An ExpressJS app on port 3000 for serving the game content in an iframe
- A Karma server on port 9876 for interacting with Firefox
I've seen the karma process start but never actually run tests, and I think this just due to general flakiness.

We're using _old versions_ of karma and related tools (based on the version in the Learning Analytics Client as of version `5.6.3`).
For some reason, I couldn't get the newer versions to work properly and had to revert to old versions.
Be mindful of this when reading the associated documentation for karma, mocha, and other tools.
