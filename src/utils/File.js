/** @module File */

const fs = require('fs');
const path = require('path');


/**
 * Checks if the path exists.
 * @param {string} path - File/directory path to check.
 * @return {boolean} Whether or not the path exists.
*/
function pathExists(pathToCheck) {
  try {
    return fs.existsSync(pathToCheck);
  } catch (err) {
    throw new Error(`Unable to determine if file exists: ${err}`);
  }
}

/**
 * Checks if the path is a directory.
 * @param {string} dirPath - Path to check.
*/
function isDir(dirPath) {
  try {
    if (pathExists(dirPath)) {
      try {
        const stat = fs.lstatSync(dirPath);
        return stat.isDirectory();
      } catch (e) {
        return false;
      }
    }
    return !path.extname(dirPath);
  } catch (err) {
    throw new Error(`Unable to determine if directory: ${err}`);
  }
}

/**
 * Recursively empties directory.
 * @param {string} folder - Path of folder to empty.
*/
function removeEmptyFoldersRecursively(folderToClean) {
  function cleanFolderRecursively(folder) {
    if (isDir(folder)) {

      let files = fs.readdirSync(folder);

      if (files.length > 0) {
        files.forEach(function (file) {
          cleanFolderRecursively(path.join(folder, file));
        });

        // re-evaluate files; after deleting subfolder parent folder might be empty
        files = fs.readdirSync(folder);
      }

      if (files.length === 0) {
        fs.rmdirSync(folder);
      }
    }
  }

  if (pathExists(folderToClean)) {
    cleanFolderRecursively(folderToClean);
  }
  return true;
}

module.exports = {
  removeEmptyFoldersRecursively
};
