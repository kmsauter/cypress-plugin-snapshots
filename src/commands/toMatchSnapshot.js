/* globals cy */
/* eslint-env browser */
const logMessage = require('../utils/test/logMessage');
const { NO_LOG, TASK_MATCH_TEXT } = require('../constants');

function toMatchSnapshot(taskData) {
  return cy.task(
    TASK_MATCH_TEXT,
    taskData,
    NO_LOG
  ).then(logMessage);
}

module.exports = toMatchSnapshot;
