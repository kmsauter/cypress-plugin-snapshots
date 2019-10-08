const tasks = require('./src/tasks/');

/**
 * Initializes the plugin:
 * - registers tasks for `toMatchSnapshot` and `toMatchImageSnapshot`.
 * @param {Function} on - Method to register tasks
 * @param {Object} globalConfig - Object containing global Cypress config
 */
function initPlugin(on) {
  on('before:browser:launch', (browser = {}, args) => {
    if (browser.name === 'chrome') {
      args.push('--font-render-hinting=medium');
      args.push('--enable-font-antialiasing');
      args.push('--disable-gpu');
    }
    return args;
  });

  on('task', tasks);
}

module.exports = {
  initPlugin
};
