const { initPlugin } = require('cypress-plugin-snapshots/plugin');
const { initTestTasks } = require('./tasks');

module.exports = (on, config) => {
  initPlugin(on, config);
  initTestTasks(on);

  const port = process.env.CYPRESS_TESTSERVER_PORT;
  if (port) {
    config.baseUrl = config.baseUrl.replace(':8080', `:${port}`)
  }

  return config;
}
