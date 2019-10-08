/* globals Cypress */
/* eslint-env browser */
const { merge, cloneDeep } = require('lodash');
const { initUi, closeSnapshotModals } = require('./src/ui/ui');
const commands = require('./src/commands/index');
const cleanUpSnapshots = require('./src/utils/commands/cleanupSnapshots');
const getConfig = require('./src/utils/commands/getConfig');
const { NO_LOG, TASK_CLEANUP_FOLDERS } = require('./src/constants');
const getTaskData = require('./src/utils/commands/getTaskData');
const { getCustomName } = require('./src/config');

function addCommand(commandName, method) {
  Cypress.Commands.add(commandName, {
    prevSubject: true
  }, (subject, taskOptions) => {

    const options = merge({}, cloneDeep(getConfig()), taskOptions);

    const taskData = getTaskData({
      commandName,
      options,
      customName: getCustomName(options),
      subject
    });

    return method(taskData);
  });
}

function initCommands() {
  // Initialize config by getting it once
  getConfig();

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
    cleanUpSnapshots();
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
