const { expect } = require('chai');

const { GAME_SERVER_PORT, REQUIRED_FEATURES } = require('./lib/constants.js');

describe('test suite', () => {
  let iframe;
  let container;
  let features;

  before((done) => {
    iframe = document.createElement('iframe');
    iframe.id = 'game';
    document.body.appendChild(iframe);

    container = new springroll.Container('#game');
    container.openPath(`http://localhost:${GAME_SERVER_PORT}`);

    const start = Date.now();
    container.on('features', (event) => {
      console.log(`Features received in ${Date.now() - start}ms`);
      features = event;
      done();
    });
  });

  after(() => {
    container.close();
    document.body.removeChild(iframe);
  });

  for (const featureName of REQUIRED_FEATURES) {
    it(`should support ${featureName}`, async () => {
      expect(features[featureName]).to.equal(true);
    });
  }
});
