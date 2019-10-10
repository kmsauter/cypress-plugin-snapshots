const { Base64 } = require('js-base64');
const { cloneDeep } = require('lodash');
const { URL_PREFIX, STATE_AUTOPASSED, STATE_PASSED, STATE_UPDATED } = require('../../constants');

function getLogMessage(result) {
  const linkResult = cloneDeep(result);
  const args = Base64.encode(JSON.stringify(linkResult));

  const passedMessages = {
    [STATE_AUTOPASSED]: 'Snapshot created, autopassed',
    [STATE_PASSED]: 'Snapshots match',
    [STATE_UPDATED]: 'Snapshot updated'
  };

  const message = result.passed ?
    `[${passedMessages[result.state]}](${URL_PREFIX}${args})` :
    `[compare snapshot](${URL_PREFIX}${args})`;

  return message;
}

function logMessage(result) {
  const {
    subject,
    passed
  } = result;

  const message = getLogMessage(result);
  const log = Cypress.log({
    $el: subject,
    name: result.commandName,
    displayName: 'snapshot',
    message,
    consoleProps: () => result
  });

  if (!passed) {
    log.set('state', 'failed');
    throw new Error('Snapshots do not match.');
  }

  return result;
}

module.exports = logMessage;
