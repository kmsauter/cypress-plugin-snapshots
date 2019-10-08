const path = require('path');
const fs = require('fs-extra');
const unidiff = require('unidiff');
const prettier = require('prettier');
const { TYPE_JSON } = require('../../constants');
const removeExcludedFields = require('../text/removeExcludedFields');
const { formatJson, normalizeObject } = require('../text/json');

function subjectToSnapshot(subject, dataType = TYPE_JSON, config = {}) {
  let result = subject;

  if (dataType === TYPE_JSON) {
    result = formatJson(result);
  }

  if (typeof subject === 'object' && dataType === TYPE_JSON && config.normalizeJson) {
    result = normalizeObject(subject);
  }

  if (dataType === TYPE_JSON && config && config.excludeFields) {
    result = removeExcludedFields(result, config.excludeFields);
  }

  const prettierConfig = config.prettierConfig[dataType];
  if (prettierConfig) {
    try {
      if (typeof result === 'object') {
        result = formatJson(result, undefined, 2);
      }

      result = prettier.format(result.trim(), prettierConfig).trim();
    } catch(err) {
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

function getDiff(expected, actual, snapshotTitle, options) {
  return unidiff.diffAsText(formatDiff(expected), formatDiff(actual), {
    aname: snapshotTitle,
    bname: snapshotTitle,
    context: options.diffLines
  });
}

function createDiff(expected, actual, snapshotTitle, options) {
  return getDiff(expected, actual, snapshotTitle, options) || getDiff('', expected, snapshotTitle, options);
}

function getSnapshot(filename, snapshotTitle, dataType = TYPE_JSON, config = {}) {
  fs.ensureDirSync(path.dirname(filename));

  if (fs.existsSync(filename)) {
    const snapshots = readFile(filename);
    if (snapshots[snapshotTitle]) {
      return subjectToSnapshot(snapshots[snapshotTitle], dataType, config);
    }
  } else {
    fs.writeFileSync(filename, '{}');
  }

  return false;
}

function readFile(filename) {
  if (fs.existsSync(filename)) {
    let content;
    try {
      delete require.cache[filename];
      content = require(filename); // eslint-disable-line import/no-dynamic-require
    } catch(ex) {
      // eslint-disable-next-line no-console
      console.warn(`Cannot read snapshot file "${filename}" as javascript, falling back to JSON parser:`, ex);
      const fileContents = fs.readFileSync(filename, 'utf8');

      if (!fileContents || !fileContents.trim() || fileContents.trim().slice(0, 1) !== '{') {
        throw new Error(`Cannot load snapshot file. File "${filename} does not contain valid JSON or javascript`);
      }

      try {
        content = JSON.parse(fileContents);
      } catch(jsonEx) {
        throw new Error(`Cannot read snapshot "${filename}" as JSON: ${jsonEx}`);
      }
    }

    return content;
  }

  return {};
}

function updateSnapshot(filename, snapshotTitle, subject) {
  const store = readFile(filename);
  store[snapshotTitle] = subject;

  // Reformat to `exports` format which is nicer for Git diffs
  const saveResult = Object.keys(store).reduce((result, key) => {
    let value = store[key];
    if (typeof value === 'string') {
      value = ` \`\n${value.trim().replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\n\``;
    } else {
      value = `\n${formatJson(value)}`;
    }
    result += `exports[\`${key}\`] =${value}`;
    result += ';\n\n';

    return result;
  }, '');

  fs.writeFileSync(filename, `${saveResult.trim()}\n`);
}

module.exports = {
  createDiff,
  formatDiff,
  getSnapshot,
  subjectToSnapshot,
  updateSnapshot,
  getDiff
};
