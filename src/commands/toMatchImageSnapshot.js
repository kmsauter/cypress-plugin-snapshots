/* globals cy */
/* eslint-env browser */
const { pick } = require('lodash');
const logMessage = require('../utils/test/logMessage');
const { NO_LOG, TASK_MATCH_IMAGE, SCREENSHOT_ARGS } = require('../constants');
const getImageData = require('../utils/image/getImageData');

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

function toMatchImageSnapshot(taskData) {
  const {
    options,
    subject,
    snapshotTitle
  } = taskData;

  const taskOptions = pick(options, SCREENSHOT_ARGS);
  const screenShotConfig = Object.assign(options.screenshotConfig || {}, taskOptions);

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
    .screenshot(snapshotTitle, screenShotConfig)
    .then(() => cy.task(
      TASK_MATCH_IMAGE,
      taskData,
      NO_LOG
    ).then(logMessage));
}

module.exports = toMatchImageSnapshot;
