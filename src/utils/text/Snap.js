/** @module Snap */

const prettier = require('prettier');
const unidiff = require('unidiff');
const { TYPE_JSON } = require('../../constants');
const { readSnapFile, saveSnapFile } = require('./SnapFile');
const { formatJson, normalizeObject, removeExcludedFields } = require('./utils');

function parseSavedSnap(obj) {
  try {
    return JSON.parse(obj);
  } catch (err) {
    return obj;
  }
}

function subjectToSnap(subject, dataType = TYPE_JSON, config = {}) {
  let result = subject;

  if(!result) {
    return String(result);
  }

  if (dataType === TYPE_JSON) {
    if (typeof subject === 'object') {
      if (config.normalizeJson) {
        result = normalizeObject(subject);
      }

      if (config.excludeFields) {
        result = removeExcludedFields(result, config.excludeFields);
      }
    }
  }

  const prettierConfig = config.prettierConfig && config.prettierConfig[dataType];
  if (prettierConfig) {
    try {
      if (typeof result === 'object') {
        result = formatJson(result, undefined, 2);
      }

      result = prettier.format(result.trim(), prettierConfig).trim();
    } catch (err) {
      throw new Error(`Cannot format subject: ${result}`);
    }
  }

  return result;
}

function formatDiff(subject) {
  if (typeof subject === 'object') {
    return formatJson(subject);
  }
  return String(subject || '');
}

function createDiff(expected, actual, snapshotTitle, options) {
  return unidiff.diffAsText(formatDiff(expected), formatDiff(actual), {
    aname: snapshotTitle,
    bname: snapshotTitle,
    context: options.diffLines
  });
}

function snapExists(filePath, snapshotTitle) {
  const snapshots = readSnapFile(filePath);
  return Object.prototype.hasOwnProperty.call(snapshots, snapshotTitle);
}

function getSnap(filePath, snapshotTitle, dataType = TYPE_JSON, config = {}) {
  const snapshots = readSnapFile(filePath);
  let snap = snapshots[snapshotTitle];
  if (snap && snap.replace) {
    snap = snap.replace(/^\n|\n$/g, '');
    return subjectToSnap(parseSavedSnap(snap), dataType, config);
  }
  return snap;
}

function updateSnap(filePath, snapshotTitle, subject) {
  const store = readSnapFile(filePath);
  store[snapshotTitle] = subject;
  saveSnapFile(store, filePath);
}

module.exports = {
  subjectToSnap,
  createDiff,
  formatDiff,
  snapExists,
  getSnap,
  updateSnap
};
