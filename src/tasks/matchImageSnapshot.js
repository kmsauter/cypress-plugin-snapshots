const rimraf = require('rimraf').sync;
const path = require('path');
const { getImageSnapshotFilename } = require('../utils/Snapshot');
const getImageData = require('../utils/image/getImageData');
const saveImageSnapshot = require('../utils/image/saveImageSnapshot');
const {
  getImageObject, compareImages, moveActualImageToSnapshotsDirectory, createDiffObject, resizeImage
} = require('../utils/tasks/imageSnapshots');
const { IMAGE_TYPE_DIFF, IMAGE_TYPE_ACTUAL } = require('../constants');

async function matchImageSnapshot(data = {}) {
  const {
    commandName,
    dataType,
    image,
    options,
    snapshotTitle,
    subject,
    testFile
  } = data;
  if (!image) {
    throw new Error('\'image\' not defined');
  } else if (!image.devicePixelRatio) {
    throw new Error('\'image.devicePixelRatio\' not defined');
  }

  const actualFilename = getImageSnapshotFilename(testFile, snapshotTitle, IMAGE_TYPE_ACTUAL);
  const diffFilename = getImageSnapshotFilename(testFile, snapshotTitle, IMAGE_TYPE_DIFF);
  const snapshotFile = getImageSnapshotFilename(testFile, snapshotTitle);
  const resized = options && options.imageConfig.resizeDevicePixelRatio && image.devicePixelRatio !== 1;
  if (resized) {
    await resizeImage(image.path, actualFilename, image.devicePixelRatio);
  }
  if (resized === false) {
    moveActualImageToSnapshotsDirectory(data);
  } else {
    image.path = actualFilename;
  }

  const expected = getImageObject(snapshotFile);
  const exists = expected !== false;
  const autoPassed = options.autopassNewSnapshots && expected === false;
  const actual = exists || resized ? getImageObject(image.path, true) : image;
  const passed = expected && compareImages(expected, actual, diffFilename, options.imageConfig);

  actual.resized = resized !== false;

  let updated = false;

  if ((options.updateSnapshots && !passed) || expected === false) {
    saveImageSnapshot({ testFile, snapshotTitle, actual });
    updated = true;
  }

  if (passed && actual && actual.path) {
    rimraf(actual.path);
  }

  const diff = passed || autoPassed || !options.imageConfig.createDiffImage ?
    undefined : createDiffObject(diffFilename);

  const result = {
    actual: getImageData(actual),
    commandName,
    dataType,
    diff,
    exists,
    expected: getImageData(expected),
    passed: passed || autoPassed,
    snapshotFile: path.relative(process.cwd(), snapshotFile),
    snapshotTitle,
    subject,
    updated,
    isImage: true,
    options
  };

  return result;
}

module.exports = matchImageSnapshot;
