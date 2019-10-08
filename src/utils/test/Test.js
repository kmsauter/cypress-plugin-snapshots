require('./Mocha');

function getTestTitle(separator = ' > ', includeSpec = true) {
  const { test } = Cypress.mocha.getRunner();
  const titlePath = test.titlePath();

  if (!includeSpec) {
    titlePath.shift();
    return titlePath.join(separator);
  }
  return titlePath.join(separator);
}

function getSpec() {
  if (Cypress.spec.absolute === '__all') {
    throw new Error('cypress-plugin-snapshots does not work when running all tests, this will be fixed once this bug is resolved: https://github.com/cypress-io/cypress/issues/3090');
  }
  return Cypress.spec;
}

module.exports = {
  getTestTitle,
  getSpec
};
