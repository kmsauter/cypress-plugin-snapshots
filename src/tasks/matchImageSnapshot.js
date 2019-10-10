const Image = require('../utils/Image');
const { getImageSnapshotFilename } = require('../utils/Snapshot');
const { pathExists } = require('../utils/File');
const { STATE_AUTOPASSED, STATE_PASSED, STATE_FAILED, STATE_UPDATED, STATE_NEW } = require('../constants');

async function matchImageSnapshot(data = {}) {
  const {
    commandName,
    dataType,
    image,
    options,
    snapshotTitle,
    testFile
  } = data;

  const {
    autopassNewSnapshots,
    imageConfig,
    updateSnapshots
  } = options;

  if (!image) {
    throw new Error('\'image\' not defined');
  }

  // Defaults
  let passed = false, state = STATE_NEW, expected, diff, dimensions;

  const snapshotFile = getImageSnapshotFilename(testFile, snapshotTitle);
  const resized = imageConfig.resizeDevicePixelRatio && image.devicePixelRatio !== 1;

  /* ACTUAL */
  const actual = await new Image(image.path);

  // resize
  if (resized) {
    actual.resize(
      Math.floor(actual.image.bitmap.width / image.devicePixelRatio),
      Math.floor(actual.image.bitmap.height / image.devicePixelRatio)
    );
  }

  // doesnt exist || update
  if ((!pathExists(snapshotFile) && autopassNewSnapshots) || updateSnapshots) {
    actual.move(snapshotFile);
    passed = true;
    state = updateSnapshots ? STATE_UPDATED : STATE_AUTOPASSED;
    dimensions = {
      width: actual.image.bitmap.width,
      height: actual.image.bitmap.height
    };
  }

  /* EXPECTED */
  else {
    expected = await new Image(snapshotFile);
    diff = expected.compareTo(actual, testFile, snapshotTitle, imageConfig);
    passed = diff.passed; /* eslint-disable-line prefer-destructuring */
    state = passed ? STATE_PASSED : STATE_FAILED;
    dimensions = {
      width: expected.image.bitmap.width,
      height: expected.image.bitmap.height
    };
  }

  // clean up snapshots
  if (actual && actual.image) {
    delete actual.image;
  }

  if (expected && expected.image) {
    delete expected.image;
  }

  return {
    commandName,
    dataType,
    isImage: true,
    options,
    snapshotTitle,
    dimensions,
    passed,
    state,
    diff: diff.diff,
    actual,
    expected
  };
}

module.exports = matchImageSnapshot;
