/* globals cy */
/* eslint-env browser */
const getTaskData = require('../utils/commands/getTaskData');
const logMessage = require('../utils/test/logMessage');
const { NO_LOG, TASK_MATCH_TEXT, COMMAND_MATCH_SNAPSHOT: commandName } = require('../constants');

function toMatchSnapshot(subject, options) {
  const taskData = getTaskData({
    commandName,
    options,
    subject
  });

  return cy.task(
    TASK_MATCH_TEXT,
    taskData,
    NO_LOG
  ).then(logMessage);
}

module.exports = toMatchSnapshot;
