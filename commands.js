/* globals Cypress */
/* eslint-env browser */
const { merge } = require('lodash');
const commands = require('./src/commands/index');
const { NO_LOG, TASK_CLEANUP, COMMAND_MATCH_IMAGE_SNAPSHOT } = require('./src/constants');
const { initConfig, CONFIG_KEY } = require('./src/config');
const { initUi, closeSnapshotModals } = require('./src/ui/ui');
const { getSnapshotTitle, SNAPSHOT_TITLES_TEXT } = require('./src/utils/Snapshot');
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

  // Clean up unused snapshots and remove empty folders
  after(() => {
    cy.task(TASK_CLEANUP, {
      config,
      spec: getSpec(),
      folderPath: Cypress.config('screenshotsFolder'),
      snaps: SNAPSHOT_TITLES_TEXT
    }, NO_LOG).then((result) => {
      Cypress.log({
        name: 'Cleanup',
        message: 'Cleanup',
        consoleProps: () => result
      });
    });
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
