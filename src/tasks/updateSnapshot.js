const fs = require('fs-extra');
const rimraf = require('rimraf').sync;
const { createDiff, updateSnap } = require('../utils/text/Snap');

function updateSnapshot(data) {
  if (data.isImage) {
    rimraf(data.expected.path);
    rimraf(data.diff.path);
    fs.moveSync(data.actual.path, data.expected.path);
  } else {
    const {
      snapshotFile,
      snapshotTitle,
      actual,
      dataType,
      options
    } = data;

    updateSnap(snapshotFile, snapshotTitle, actual, dataType);
    data.diff = createDiff('', actual, snapshotTitle, options);
  }

  data.updated = true;
  return data;
}

module.exports = updateSnapshot;
