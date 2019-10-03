/* globals cy */
/* eslint-env browser */
const getTaskData = require('../utils/commands/getTaskData');
const logMessage = require('../utils/test/logMessage');
const { NO_LOG, TASK_MATCH_IMAGE, COMMAND_MATCH_IMAGE_SNAPSHOT: commandName } = require('../constants');
const getImageData = require('../utils/image/getImageData');
const { getImageConfig, getScreenshotConfig, getCustomName } = require('../config');

function afterScreenshot(taskData) {
  return ($el, props) => {
    // See this url for contents of `props`:
    // https://docs.cypress.io/api/commands/screenshot.html#Get-screenshot-info-from-the-onAfterScreenshot-callback
    const win = $el.get(0).ownerDocument.defaultView;
    taskData.image = getImageData(props, win.devicePixelRatio);
    taskData.isImage = true;
    delete taskData.subject;
  };
}

async function toMatchImageSnapshot(subject, commandOptions) {
  const options = getImageConfig(commandOptions);
  const customName = getCustomName(commandOptions);

  const taskData = await getTaskData({
    commandName,
    options,
    customName,
    subject
  });

  const screenShotConfig = getScreenshotConfig(commandOptions);
  const afterScreenshotFn = afterScreenshot(taskData);
  if (screenShotConfig.onAfterScreenshot) {
    const afterScreenshotCallback = screenShotConfig.onAfterScreenshot;
    screenShotConfig.onAfterScreenshot = (...args) => {
      afterScreenshotFn.apply(this, args);
      afterScreenshotCallback.apply(this, args);
    };
  } else {
    screenShotConfig.onAfterScreenshot = afterScreenshotFn;
  }

  return cy.wrap(subject, NO_LOG)
    .screenshot(taskData.snapshotTitle, screenShotConfig)
    .then(() => cy.task(
      TASK_MATCH_IMAGE,
      taskData,
      NO_LOG
    ).then(logMessage));
}

module.exports = toMatchImageSnapshot;
