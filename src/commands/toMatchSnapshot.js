/* globals cy */
/* eslint-env browser */
const logMessage = require('../utils/test/logMessage');
const { NO_LOG, TASK_MATCH_TEXT, TYPE_JSON, TYPE_HTML } = require('../constants');
const { getSubject, isHtml } = require('../utils/text/utils');

function toMatchSnapshot(taskData) {

  taskData.dataType = isHtml(taskData.subject) ? TYPE_HTML : TYPE_JSON;
  taskData.subject = getSubject(taskData.subject);

  return cy.task(
    TASK_MATCH_TEXT,
    taskData,
    NO_LOG
  ).then(logMessage);
}

module.exports = toMatchSnapshot;
