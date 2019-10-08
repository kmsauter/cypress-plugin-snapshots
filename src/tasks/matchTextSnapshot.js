const applyReplace = require('../utils/text/applyReplace');
const {
  createDiff,
  formatDiff,
  getSnapshot,
  subjectToSnapshot,
  updateSnapshot
} = require('../utils/tasks/textSnapshots');
const { getTextSnapshotFilename }= require('../utils/Snapshot');
const keepKeysFromExpected = require('../utils/text/keepKeysFromExpected');

function matchTextSnapshot({
  commandName,
  dataType,
  options,
  snapshotTitle,
  subject,
  testFile
} = {}) {
  const {
    replace,
    autopassNewSnapshots,
    updateSnapshots
  } = options;

  const snapshotFile = getTextSnapshotFilename(testFile);
  const expectedRaw = getSnapshot(snapshotFile, snapshotTitle, dataType, options);
  let expected = applyReplace(expectedRaw, replace);
  const actual = keepKeysFromExpected(subjectToSnapshot(subject, dataType, options), expected, options);

  const exists = expected !== false;

  const autoPassed = autopassNewSnapshots && expected === false;
  const passed = updateSnapshots || (expected && formatDiff(expected) === formatDiff(actual));
  const diff = createDiff(expected, actual, snapshotTitle, options);

  let updated = false;

  if (updateSnapshots || expected === false) {
    updateSnapshot(snapshotFile, snapshotTitle, actual, dataType);
    updated = true;
  }

  if (autoPassed) {
    expected = actual;
  }

  const result = {
    actual,
    commandName,
    dataType,
    diff,
    exists,
    expected,
    passed: passed || autoPassed,
    snapshotFile,
    snapshotTitle,
    subject,
    updated,
    options
  };

  return result;
}

module.exports = matchTextSnapshot;
