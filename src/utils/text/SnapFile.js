/**
 * @module SnapFile
 * Derived from jest_snapshot
 * @see https://github.com/facebook/jest
*/

const fs = require('fs');
const { pathExists, ensureDirExists } = require('../File');

const escapeBacktickStr = str => str.replace(/`|\\|\${/g, '\\$&');
const printBacktickStr = str => '`' + escapeBacktickStr(str) + '`'; /* eslint-disable-line prefer-template */
const normalizeNewlines = str => str.replace(/\r\n|\r|^\n+|\n+$/g, '\n');

/**
 * Reads snapshot file and returns snapshots as object
 * @param {string} filePath - Path of snapshot.
*/
function readSnapFile(filePath) {
  const data = Object.create(null);
  let content = '';

  if (pathExists(filePath)) {
    try {
      content = fs.readFileSync(filePath, 'utf8');
      const populate = new Function('exports', content); /* eslint-disable-line no-new-func */
      populate(data);
    } catch (e) { } /* eslint-disable-line no-empty */
  }
  return data;
};

/**
 * Reads snapshot file and returns snapshots as object
 * @param {object} snapshot - Snapshot.
 * @param {string} filePath - Path of snapshot.
*/
function saveSnapFile(snapshots, filePath) {
  const formattedSnapshots = Object.keys(snapshots)
    .map(function(key) {
      let snap = snapshots[key];
      if (typeof snap !== 'string') {
        snap = JSON.stringify(snap, undefined, 2);
      }

      return 'exports[' + printBacktickStr(key) + '] = ' + /* eslint-disable-line prefer-template */
        printBacktickStr(normalizeNewlines(`\n${snap}\n`)) +
        ';';
    });
  ensureDirExists(filePath);
  fs.writeFileSync(filePath, `${formattedSnapshots.join('\n\n')}\n`);
};

module.exports = {
  readSnapFile,
  saveSnapFile
};
