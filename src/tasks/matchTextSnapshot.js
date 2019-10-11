const applyReplace = require('../utils/text/applyReplace');
const { subjectToSnap, createDiff, formatDiff, snapExists, getSnap, updateSnap } = require('../utils/text/Snap');
const { getTextSnapshotFilename }= require('../utils/Snapshot');
const keepKeysFromExpected = require('../utils/text/keepKeysFromExpected');
const { STATE_AUTOPASSED, STATE_PASSED, STATE_FAILED, STATE_UPDATED, STATE_NEW } = require('../constants');

function matchTextSnapshot(data = {}) {
  const {
    commandName,
    dataType,
    options,
    snapshotTitle,
    testFile,
    subject
  } = data;

  const {
    replace,
    autopassNewSnapshots,
    updateSnapshots
  } = options;

  // Defaults
  let passed = false, state = STATE_NEW, expected;

  const snapshotFile = getTextSnapshotFilename(testFile);
  const exists = snapExists(snapshotFile, snapshotTitle);

  /* ACTUAL */
  let actual = subjectToSnap(subject, dataType, options);

  /* EXPECTED */
  if(exists) {
    const expectedRaw = getSnap(snapshotFile, snapshotTitle, dataType, options);
    expected = applyReplace(expectedRaw, replace);
    actual = keepKeysFromExpected(actual, expected, options);
  }

  // doesnt exist || update
  if ((!exists && autopassNewSnapshots) || updateSnapshots) {
    updateSnap(snapshotFile, snapshotTitle, actual, dataType);
    passed = true;
    state = updateSnapshots ? STATE_UPDATED : STATE_AUTOPASSED;
  }

  else {
    passed = expected && formatDiff(expected) === formatDiff(actual);
    state = passed ? STATE_PASSED : STATE_FAILED;
  }

  const diff = createDiff(passed ? '' : expected, actual, snapshotTitle, options);

  return {
    commandName,
    options,
    dataType,
    snapshotTitle,
    snapshotFile,
    passed,
    state,
    actual,
    expected,
    diff
  };
}

module.exports = matchTextSnapshot;
