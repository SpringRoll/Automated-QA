# SpringRoll Checker
This module provides a suite of tools for performing automated QA checks on SpringRoll games.

The tools currently consist of the following utilities:
- `srac` - An [karma](https://karma-runner.github.io) test suite runner for checking accessibility in SpringRoll games.
- `srlint` - An [eslint](https://eslint.org) style-checker for games.

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
npm i SOMETHING
```

After installation two commands should be available to you via `npx`:
```
npx srac
npx srlint
```

### Accessibility Checking
A typical accessibility check would look like this:
```
npx srac -p path/to/the/game
```

This will start a test server in `path/to/the/game/deploy` and a headless Firefox runner to check for a handful of game
features to be present.
Note that an optional `-c` option can be provided to set the status code upon error.
For instance:

```
npx srac -p path/to/the/game -c 123
```

will make the accessibility checker fail with status code 123 if the test suite fails.

### Linting Pass
A typical linting pass would look like this:
```
npx srlint -p path/to/the/game
```

This will start at the root of the game, look for a `src` directory and crawl it looking for non-asset JavaScript and TypeScript files.

Note that an optional `-c` option can be provided to set the status code upon error.
For instance:

```
npx srlint -p path/to/the/game/ -c 123
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

## Test Suite
There is no test suite, but there are lint scripts available via `npm run lint`

## Gotchas
The main runner for tests `lib/runner.js` spawns two processes:
- An ExpressJS app on port 3000 for serving the game content in an iframe
- A Karma server on port 9876 for interacting with Firefox
I've seen the karma process start but never actually run tests, and I think this just due to general flakiness.
