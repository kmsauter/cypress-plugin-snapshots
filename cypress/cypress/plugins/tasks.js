const rimraf = require('rimraf').sync;
const { readSnapFile, saveSnapFile } = require('../../../src/utils/text/SnapFile');
const { snapExists, getSnap, updateSnap } = require('../../../src/utils/text/Snap');

function initTestTasks(on) {
  on('task', {
    'testing:deleteFiles': (files) => {
      rimraf(files);
      return true;
    },
    'testing:callMethod': (data) => {
      switch (data.method) {
        case 'readSnapFile':
          return readSnapFile(data.filePath);
        case 'saveSnapFile':
          saveSnapFile(data.snapshots, data.filePath);
          break;
        case 'getSnap':
          return getSnap(data.filePath, data.snapshotTitle, data.dataType, data.config);
        case 'snapExists':
          return snapExists(data.filePath, data.snapshotTitle);
        case 'updateSnap':
          updateSnap(data.filePath, data.snapshotTitle, data.subject);
      }
      return true;
    }
  });
}

module.exports = {
  initTestTasks
}
