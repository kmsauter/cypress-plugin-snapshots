const {
  TASK_GET_FILE,
  TASK_MATCH_IMAGE,
  TASK_MATCH_TEXT,
  TASK_CLEANUP,
  TASK_UPDATE_SNAPSHOT
} = require('../constants');

module.exports = {
  [TASK_GET_FILE]: require('./getFile'),
  [TASK_MATCH_IMAGE]: require('./matchImageSnapshot'),
  [TASK_MATCH_TEXT]: require('./matchTextSnapshot'),
  [TASK_CLEANUP]: require('./cleanup'),
  [TASK_UPDATE_SNAPSHOT]: require('./updateSnapshot')
};
