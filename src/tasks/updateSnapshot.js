const fs = require('fs-extra');
const rimraf = require('rimraf').sync;
const textSnapshots = require('../utils/tasks/textSnapshots');

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

    textSnapshots.updateSnapshot(snapshotFile, snapshotTitle, actual, dataType);
    data.diff = textSnapshots.getDiff('', actual, snapshotTitle, options);
  }

  data.updated = true;
  return data;
}

module.exports = updateSnapshot;
