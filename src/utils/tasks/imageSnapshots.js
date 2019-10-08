const { createHash } = require('crypto');
const { PNG } = require('pngjs');
const fs = require('fs-extra');
const pixelmatch = require('pixelmatch');
const rimraf = require('rimraf').sync;
const Jimp = require('jimp');
const imageSize = require('image-size');
const { getImageSnapshotFilename } = require('../Snapshot');
const getImageData = require('../image/getImageData');
const { IMAGE_TYPE_ACTUAL } = require('../../constants');

function moveActualImageToSnapshotsDirectory({ image, snapshotTitle, testFile } = {}) {
  if (image && image.path) {
    const filename = getImageSnapshotFilename(testFile, snapshotTitle, IMAGE_TYPE_ACTUAL);
    rimraf(filename);
    if (fs.existsSync(image.path)) {
      fs.moveSync(image.path, filename);
    }
    image.path = filename;
  }
}

function createDiffObject(filename) {
  const imageObject = getImageObject(filename, false);
  return getImageData(imageObject);
}

/**
 * Create object containing `image`, `path`, `width`, `height` and `hash`
 * property based on an image file.
 *
 * Returns false if file does not exist.
 *
 * @param {string} filename - Path to image to read
 * @param {boolean} addHash - Add hash to result
 */
function getImageObject(filename, addHash = true) {
  const exists = fs.existsSync(filename);
  const size = exists ? fs.statSync(filename).size : 0;

  if (size > 0) {
    const image = PNG.sync.read(fs.readFileSync(filename));
    const hash = addHash !== false ?
      createHash('sha1').update(image.data).digest('base64') : undefined;

    return {
      path: filename,
      image,
      hash,
      height: image.height,
      width: image.width
    };
  }

  return false;
}

function resizeImage(filename, targetFile, devicePixelRatio) {
  if (devicePixelRatio !== 1 && fs.existsSync(filename)) {
    const dimensions = imageSize(filename);
    const height = Math.floor(dimensions.height / devicePixelRatio);
    const width = Math.floor(dimensions.width / devicePixelRatio);

    return Jimp.read(filename)
      .then(image => image
        .resize(width, height)
        .writeAsync(targetFile))
      .then(() => fs.remove(filename))
      .then(() => true)
      .catch(err => {
        throw new Error(err);
      });
  }

  return Promise.resolve(false);
}

function createCompareCanvas(width, height, source) {
  const canvas = new PNG({
    width,
    height,
    colorType: 6,
    bgColor: {
      red: 0,
      green: 0,
      blue: 0,
      alpha: 0
    }
  });
  PNG.bitblt(source, canvas, 0, 0, source.width, source.height, 0, 0);
  return canvas;
}

/**
 * Create a canvas that can fit both `expected` and `actual` image.
 * Makes it easier to compare images (and also nicer diff result).
 * @param {*} expected
 * @param {*} actual
 */
function makeImagesEqualSize(expected, actual) {
  const height = Math.max(expected.height, actual.height);
  const width = Math.max(expected.width, actual.width);
  actual.image = createCompareCanvas(width, height, actual.image);
  expected.image = createCompareCanvas(width, height, expected.image);
}

function compareImageSizes(expected, actual) {
  return expected.width === actual.width &&
    actual.height === expected.height;
}

function compareImages(expected, actual, diffFilename, config) {
  const {
    createDiffImage,
    threshold,
    thresholdType
  } = config;

  let passed = false;
  rimraf(diffFilename);

  if (actual !== false) {
    const hashMatches = expected.hash === actual.hash;
    if (hashMatches) {
      return true;
    }

    const sizeMatch = compareImageSizes(expected, actual);
    if (!sizeMatch) {
      makeImagesEqualSize(expected, actual);
    }

    const pixelmatchConfig = {
      threshold: 0.01
    };

    const imageWidth = actual.image.width;
    const imageHeight = actual.image.height;

    const diffImage = createDiffImage ? new PNG({
      height: imageHeight,
      width: imageWidth
    }) : null;

    const totalPixels = imageWidth * imageHeight;
    const diffPixelCount = pixelmatch(
      actual.image.data,
      expected.image.data,
      diffImage ? diffImage.data : null,
      imageWidth,
      imageHeight,
      pixelmatchConfig
    );

    if (thresholdType === 'pixel') {
      passed = diffPixelCount <= threshold;
    } else if (thresholdType === 'percent') {
      const diffRatio = diffPixelCount / totalPixels;
      passed = diffRatio <= threshold;
    } else {
      throw new Error(`Unknown imageConfig.thresholdType: ${thresholdType}. 
        Valid options are "pixel" or "percent".`);
    }

    if (!passed && diffImage) {
      // Set filter type to Paeth to avoid expensive auto scanline filter detection
      // For more information see https://www.w3.org/TR/PNG-Filters.html
      const pngBuffer = PNG.sync.write(diffImage, {
        filterType: 4
      });
      fs.writeFileSync(diffFilename, pngBuffer);
    }
  }

  return passed;
}

function saveImageSnapshot(data) {
  rimraf(data.expected.path);
  rimraf(data.diff.path);
  fs.moveSync(data.actual.path, data.expected.path);
}

module.exports = {
  compareImages,
  createDiffObject,
  getImageObject,
  saveImageSnapshot,
  moveActualImageToSnapshotsDirectory,
  resizeImage
};
