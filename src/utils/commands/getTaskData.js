const { getTestTitle, getSpec } = require('../test/Test');
const { getSnapshotTitle } = require('../Snapshot');
const { getSubject, isHtml } = require('../text/html');
const { TYPE_IMAGE, TYPE_JSON, TYPE_HTML, COMMAND_MATCH_IMAGE_SNAPSHOT } = require('../../constants');

function isImage(commandName) {
  return commandName === COMMAND_MATCH_IMAGE_SNAPSHOT;
}

function getDataType({ commandName, subject }) {
  if (isImage(commandName)) {
    return TYPE_IMAGE;
  }

  return isHtml(subject) ? TYPE_HTML : TYPE_JSON;
}

function getTaskData({
  commandName,
  options,
  customName,
  subject: testSubject
} = {}) {
  const subjectIsImage = isImage(commandName);
  const testTitle = getTestTitle();
  const spec = getSpec();
  const testFile = spec.absolute;
  const snapshotTitle = getSnapshotTitle(customName, subjectIsImage);
  const subject = subjectIsImage ? testSubject : getSubject(testSubject);
  const dataType = getDataType({ commandName, subject: testSubject });

  return {
    commandName,
    dataType,
    options,
    snapshotTitle,
    subject,
    testFile,
    testTitle
  };
}

module.exports = getTaskData;
