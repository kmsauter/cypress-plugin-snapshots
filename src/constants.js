module.exports = {

  /* Command Names */
  COMMAND_MATCH_SNAPSHOT: 'toMatchSnapshot',
  COMMAND_MATCH_IMAGE_SNAPSHOT: 'toMatchImageSnapshot',

  /* Task Names */
  TASK_GET_FILE: 'cypress-plugin-snapshot:getFile',
  TASK_MATCH_IMAGE: 'cypress-plugin-snapshot:matchImage',
  TASK_MATCH_TEXT: 'cypress-plugin-snapshot:matchText',
  TASK_CLEANUP_FOLDERS: 'cypress-plugin-snapshot:cleanupFolders',
  TASK_UPDATE_SNAPSHOT: 'cypress-plugin-snapshot:updateSnapshot',

  /* Data Types */
  TYPE_HTML: 'html',
  TYPE_IMAGE: 'image',
  TYPE_JSON: 'json',

  /* Paths */
  PATH_CSS: './assets/styles.css',
  PATH_DIFF_CSS: 'diff2html/dist/diff2html.css',
  DIR_IMAGE_SNAPSHOTS: '__image_snapshots__',
  DIR_SNAPSHOTS: '__snapshots__',

  /* Cypress */
  NO_LOG: { log: false },
  SCREENSHOT_ARGS: [
    'log',
    'blackout',
    'capture',
    'clip',
    'disableTimersAndAnimations',
    'scale',
    'timeout',
    'onBeforeScreenshot',
    'onAfterScreenshot'
  ],

  /* Other */
  URL_PREFIX: '#cypress-plugin-snapshot-',
  IMAGE_TYPE_DIFF: 'diff',
  IMAGE_TYPE_ACTUAL: 'actual'

};
