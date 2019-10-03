const path = require('path');
const sanitizeFilename = require('sanitize-filename'); // todo
const { DIR_SNAPSHOTS, DIR_IMAGE_SNAPSHOTS } = require('../constants');
const { getTestTitle } = require('./test/Test');

const SNAPSHOTS_TEXT = {};
const SNAPSHOTS_IMAGE = {};

const SNAPSHOT_TITLES_TEXT = [];
const SNAPSHOT_TITLES_IMAGE = [];

function getFilename(testFile, snapshotDir, filename) {
  const dir = path.join(path.dirname(testFile), snapshotDir);
  return path.join(dir, sanitizeFilename(filename));
}

function getTextSnapshotFilename(testFile) {
  const filename = `${path.basename(testFile)}.snap`;
  return getFilename(testFile, DIR_SNAPSHOTS, filename);
}

function getImageSnapshotFilename(testFile, snapshotTitle, type = '') {
  const fileType = type ? `.${type}` : '';
  return getFilename(testFile, DIR_IMAGE_SNAPSHOTS, `${snapshotTitle}${fileType}.png`);
}


function snapshotTitleIsUsed(snapshotTitle, isImage = false) {
  return (isImage ? SNAPSHOT_TITLES_IMAGE : SNAPSHOT_TITLES_TEXT).indexOf(snapshotTitle) !== -1;
}

function getSnapshotTitle(customName, isImage = false) {
  const name = customName || getTestTitle();
  const snapshots = isImage ? SNAPSHOTS_IMAGE : SNAPSHOTS_TEXT;

  if (snapshots[name] !== undefined) {
    snapshots[name] += 1;
  } else {
    snapshots[name] = 0;
  }

  const snapshotTitle = `${name} #${snapshots[name]}`;
  (isImage ? SNAPSHOT_TITLES_IMAGE : SNAPSHOT_TITLES_TEXT).push(snapshotTitle);
  return snapshotTitle;
}

module.exports = {
  getTextSnapshotFilename,
  getImageSnapshotFilename,
  snapshotTitleIsUsed,
  getSnapshotTitle
};
