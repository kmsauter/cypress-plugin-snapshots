const rewire = require('rewire');
const { initCommands } = require('../commands');
const { initConfig } = require('../src/config');
const DEFAULT_CONFIG = rewire('../src/config').__get__('DEFAULT_CONFIG');

global.Cypress = {
  env: () => ({}),
  config: () => {},
  Commands: { add: jest.fn(), },
  on: () => ({}),
  browser: {
    isHeadless: true
  },
  $: () => ({})
};

global.cy = {};

describe('commands', () => {
  it('initCommands', () => {
    global.before = jest.fn();
    global.after = jest.fn();
    global.cy.task = jest.fn().mockResolvedValue({ passed: true });

    initCommands();

    expect(global.Cypress.Commands.add).toBeCalled();
    expect(global.Cypress.Commands.add.mock.calls.length).toEqual(2);
    expect(global.Cypress.Commands.add.mock.calls[0][0]).toEqual('toMatchSnapshot');
    expect(global.after).toBeCalled();
  });

  describe('should init/retrieve config', () => {
    it('with string config', () => {
      let returnValue = JSON.stringify(DEFAULT_CONFIG);
      global.Cypress.env = (name, value) => {
        if (value) {
          returnValue = value;
        }
        return returnValue;
      };
      expect(initConfig()).toMatchObject(DEFAULT_CONFIG);
    });

    it('with config', () => {
      global.Cypress.env = () => { foo: 'bar' };
      expect(initConfig()).toMatchObject(DEFAULT_CONFIG);
    });

    it('with empty config', () => {
      global.Cypress.env = () => undefined;
      expect(initConfig()).toMatchObject(DEFAULT_CONFIG);
    });
  });
});
