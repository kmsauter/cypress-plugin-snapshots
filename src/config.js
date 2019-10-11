const { merge } = require('lodash');

const CONFIG_KEY = 'cypress-plugin-snapshots';

const DEFAULT_CONFIG = Object.freeze({
  autoCleanUp: false,
  autopassNewSnapshots: true,
  diffLines: 3,
  excludeFields: [],
  ignoreExtraArrayItems: false,
  ignoreExtraFields: false,
  imageConfig: {
    createDiffImage: true,
    resizeDevicePixelRatio: true,
    threshold: 0.1,
    thresholdType: 'percent' // can be 'percent' or 'pixel'
  },
  normalizeJson: true,
  prettier: true,
  prettierConfig: {
    html: {
      parser: 'html',
      tabWidth: 2,
      endOfLine: 'lf'
    }
  },
  screenshotConfig: {
    log: false,
    blackout: ['.snapshot-diff']
  },
  updateSnapshots: false,
  backgroundBlend: 'difference',
  name: '',
  diffFormat: 'side-by-side'
});

let config = merge({}, DEFAULT_CONFIG);

function initConfig(initialConfig) {
  config = merge({}, DEFAULT_CONFIG, initialConfig);

  config.screenshotConfig.blackout = config.screenshotConfig.blackout || [];
  config.screenshotConfig.blackout.push('.snapshot-diff');

  Cypress.env(CONFIG_KEY, config);
  return config;
}

module.exports = {
  CONFIG_KEY,
  initConfig
};
