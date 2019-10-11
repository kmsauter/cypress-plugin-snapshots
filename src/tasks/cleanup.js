const { removeEmptyFoldersRecursively } = require('../utils/File');
const { getTextSnapshotFilename } = require('../utils/Snapshot');
const { readSnapFile, saveSnapFile } = require('../utils/text/SnapFile');

function cleanup({ config, folderPath, snaps = [], spec }) {
  let snapsToRemove = [];

  if (config.autoCleanUp) {
    const filePath = getTextSnapshotFilename(spec.relative);
    const snapshots = readSnapFile(filePath);

    // Get snapshots to remove
    Object.keys(snapshots).forEach((snap) => {
      if (!snaps.includes(snap)) {
        snapsToRemove.push(snap);
      }
    });

    // Remove snapshots
    snapsToRemove.forEach((snap) => {
      delete snapshots[snap];
    });

    saveSnapFile(snapshots, filePath);
  }

  // Removes empty folders created by snapshots
  removeEmptyFoldersRecursively(folderPath);

  return {
    snapsToRemove
  };
}

module.exports = cleanup;
