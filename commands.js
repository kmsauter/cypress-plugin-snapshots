/* globals Cypress */
/* eslint-env browser */
const { merge } = require('lodash');
const commands = require('./src/commands/index');
const cleanUpSnapshots = require('./src/utils/commands/cleanupSnapshots');
const { NO_LOG, TASK_CLEANUP_FOLDERS, COMMAND_MATCH_IMAGE_SNAPSHOT } = require('./src/constants');
const { initConfig, CONFIG_KEY } = require('./src/config');
const { initUi, closeSnapshotModals } = require('./src/ui/ui');
const { getSnapshotTitle } = require('./src/utils/Snapshot');
const { getTestTitle, getSpec } = require('./src/utils/test/Test');

let config;

function addCommand(commandName, method) {
  Cypress.Commands.add(commandName, {
    prevSubject: true
  }, (subject, taskOptions) => {

    const options = merge({}, config, taskOptions);
    const snapshotTitle = getSnapshotTitle(options.name, commandName === COMMAND_MATCH_IMAGE_SNAPSHOT);

    return method({
      commandName,
      options,
      subject,
      testFile: getSpec().absolute,
      testTitle: getTestTitle(),
      snapshotTitle
    });
  });
}

function initCommands() {
  // Initialize config
  config = initConfig(Cypress.env(CONFIG_KEY));

  if (!Cypress.browser.isHeadless) {

    // Inject CSS & JavaScript
    before(() => {
      initUi();

      // Close snapshot modal before all test restart
      closeSnapshotModals();
    });
  }

  function clearFileCache() {
    Cypress.__readFileCache__ = {}; /* eslint-disable-line no-underscore-dangle */
  }

  // Close snapshot modal and reset image files cache before all test restart
  Cypress.on('window:before:unload', () => {
    clearFileCache();
  });

  // Add test icons and clean up unused snapshots
  after(() => {
    cleanUpSnapshots(config);
    cy.task(TASK_CLEANUP_FOLDERS, Cypress.config('screenshotsFolder'), NO_LOG);
  });

  // Add commands
  Object.keys(commands).forEach(key => addCommand(key, commands[key]));
}

module.exports = {
  initCommands
};

if (!process.env.JEST_WORKER_ID) {
  initCommands();
}
