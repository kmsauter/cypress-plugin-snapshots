const Jimp = require('jimp');
const rimraf = require('rimraf').sync;
const { getImageSnapshotFilename } = require('./Snapshot');
const { IMAGE_TYPE_DIFF, IMAGE_TYPE_ACTUAL } = require('../constants');

function Image(filePath) {
  this.path = filePath;

  const that = this;
  return Jimp.read(this.path)
    .then(function (img) {
      that.image = img;
      return that;
    })
    .catch(err => {
      throw new Error(err);
    });
}

Image.prototype.resize = function (width, height) {
  this.resized = true;
  this.image.resize(width, height);
};

Image.prototype.move = function (targetPath) {
  rimraf(this.path);
  rimraf(targetPath);
  this.image.writeAsync(targetPath);
  this.path = targetPath;
  this.updated = true;
};

Image.prototype.compareTo = function (imageToCompare, testFile, snapshotTitle, options) {
  if (!this.image || !imageToCompare.image) {
    throw new Error('Missing image.');
  }

  const {
    createDiffImage,
    thresholdType,
    threshold
  } = options;

  // Compare sizes
  const imagesEqualSize = this.image.bitmap.width === imageToCompare.image.bitmap.width &&
    this.image.bitmap.height === imageToCompare.image.bitmap.height;

  if (imagesEqualSize) {
    imageToCompare.resize(this.image.bitmap.width, this.image.bitmap.height);
  }

  // Get diff
  const imagePixels = this.image.bitmap.width * this.image.bitmap.height;
  const diff = Jimp.diff(this.image, imageToCompare.image, 0);
  const pixels = diff.percent * imagePixels;
  const hash = Jimp.distance(this.image, imageToCompare.image);

  // Get result
  let passed, diffFilename;

  if (thresholdType === 'percent') {
    passed = diff.percent <= threshold || hash <= threshold;
  } else {
    passed = pixels <= threshold || hash <= threshold / imagePixels;
  }

  if (passed) {
    rimraf(imageToCompare.path);
    imageToCompare.path = null;
  } else {
    // Actual Image
    const actualFilename = getImageSnapshotFilename(testFile, snapshotTitle, IMAGE_TYPE_ACTUAL);
    imageToCompare.move(actualFilename);

    // Diff Image
    if (createDiffImage) {
      diffFilename = getImageSnapshotFilename(testFile, snapshotTitle, IMAGE_TYPE_DIFF);
      diff.path = diffFilename;
      diff.image.filterType(4);
      diff.image.writeAsync(diffFilename);
    }
  }

  return {
    passed,
    diff: {
      pixels,
      hash: +hash.toFixed(3),
      percent: +diff.percent.toFixed(3),
      path: diffFilename
    }
  };
};

module.exports = Image;
