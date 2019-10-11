const { Base64 } = require('js-base64');
const { cloneDeep } = require('lodash');
const { URL_PREFIX, STATE_AUTOPASSED, STATE_PASSED, STATE_UPDATED } = require('../../constants');

function getLogMessage(result) {
  const linkResult = cloneDeep(result);
  const args = Base64.encode(JSON.stringify(linkResult));

  const passedMessages = {
    [STATE_AUTOPASSED]: 'Snapshot created',
    [STATE_PASSED]: 'Snapshots match',
    [STATE_UPDATED]: 'Snapshot updated'
  };

  const message = result.passed ?
    `[${passedMessages[result.state]}](${URL_PREFIX}${args})` :
    `[compare snapshot](${URL_PREFIX}${args})`;

  return message;
}

function logMessage(result) {
  const log = Cypress.log({
    name: result.commandName,
    displayName: 'snapshot',
    message: getLogMessage(result),
    consoleProps: () => result
  });

  if (!result.passed) {
    log.set('state', 'failed');
    throw new Error('Snapshots do not match.');
  }

  return result;
}

module.exports = logMessage;
