/* globals cy */
/* eslint-env browser */
const { formatJson, normalizeObject } = require('../text/utils');
const { getTextSnapshotFilename, snapshotTitleIsUsed } = require('../Snapshot');
const { getSpec } = require('../../utils/test/Test');
const { NO_LOG } = require('../../constants');

// Removes unused snapshots from snapshot file
function cleanUpSnapshots(config) {
  if (!config.autoCleanUp) {
    return;
  }

  const spec = getSpec();
  const filename = getTextSnapshotFilename(spec.relative);
  cy.readFile(filename, NO_LOG).then((content) => {
    if (content) {
      const snapshot = JSON.parse(content);
      const keys = Object.keys(snapshot);

      const cleanSnapshot = keys
        .filter(snapshotTitleIsUsed)
        .reduce((result, key) => {
          result[key] = snapshot[key];
          return result;
        }, {});

      cy.writeFile(filename,
        formatJson(normalizeObject(cleanSnapshot)),
        NO_LOG);
    }
  });
}

module.exports = cleanUpSnapshots;
