/* globals cy */
/* eslint-env browser */
const getTaskData = require('../utils/commands/getTaskData');
const logMessage = require('../utils/commands/logMessage');
const { NO_LOG, TASK_MATCH_TEXT, COMMAND_MATCH_SNAPSHOT: commandName } = require('../constants');

function toMatchSnapshot(subject, options) {
  return getTaskData({
    commandName,
    options,
    subject
  }).then(taskData => cy.task(
    TASK_MATCH_TEXT,
    taskData,
    NO_LOG
  ).then(logMessage));
}

module.exports = toMatchSnapshot;
