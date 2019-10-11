const path = require('path');
const { TYPE_JSON, TYPE_HTML } = require('../../../../../src/constants');
const { runSuites, dataFormatted } = require('../../../fixtures/data-types');

describe('Snap', () => {
  const config = {
    //autoCleanUp: false,
    //autopassNewSnapshots: true,
    //diffLines: 3,
    excludeFields: [],
    ignoreExtraArrayItems: false,
    ignoreExtraFields: false,
    normalizeJson: true,
    prettier: true,
    prettierConfig: {
      html: {
        parser: 'html',
        tabWidth: 2,
        endOfLine: 'lf'
      }
    },
    //updateSnapshots: false
  };

  const filePath = path.join(path.dirname(Cypress.spec.absolute), '__snapshots__', 'text.spec.js.snap');

  describe('snapExists', () => {
    const method = 'snapExists';

    it('exists', () => {
      const snapshotTitle = 'text > toMatchSnapshot > toMatchSnapshot > html > HTMLCollection #0';
      cy.task('testing:callMethod', { method, filePath, snapshotTitle })
        .then((exists) => {
          expect(exists).to.equal(true);
        });
    });

    it('doesnt exist', () => {
      const snapshotTitle = 'snapshot doesnt exist';
      cy.task('testing:callMethod', { method, filePath, snapshotTitle })
        .then((exists) => {
          expect(exists).to.equal(false);
        });
    });
  });

  runSuites('getSnap', function (item, itemName, suiteName) {
    const dataType = suiteName == 'html' ? TYPE_HTML : TYPE_JSON;
    const snapshotTitle = `text > toMatchSnapshot > toMatchSnapshot > ${suiteName} > ${itemName} #0`;

    let expected = dataFormatted[suiteName][itemName];
    if (['true', 'number', 'array', 'object'].includes(itemName)) {
      expected = JSON.parse(expected);
    }

    cy.task('testing:callMethod', { method: 'getSnap', filePath, snapshotTitle, dataType, config })
      .then((snap) => {
        expect(snap).to.deep.equal(expected);
      });
  }, ['object-2']);

  describe('updateSnap', () => {
    const method = 'updateSnap';
    const filePath = path.join(path.dirname(Cypress.spec.absolute), '__snapshots__', 'Snap.snap');
    
    it('snap file and snap dont exist', () => {
      const subject = { a: 1, b: 3, c: 3 };
      const expected = 'exports[`snap-1`] = `\n{\n  "a": 1,\n  "b": 3,\n  "c": 3\n}\n`;\n';

      cy.task('testing:callMethod', { method, filePath, snapshotTitle: 'snap-1', subject })
        .then(() => {
          cy.readFile(filePath).then((contents) => {
            expect(contents).to.equal(expected);
          });
        });
    });

    it('snap file exists, new snap', () => {
      const expected = 'exports[`snap-1`] = `\n{\n  "a": 1,\n  "b": 3,\n  "c": 3\n}\n`;\n\nexports[`snap-2`] = `\ntest-1\n`;\n';

      cy.task('testing:callMethod', { method, filePath, snapshotTitle: 'snap-2', subject: 'test-1' })
        .then(() => {
          cy.readFile(filePath).then((contents) => {
            expect(contents).to.equal(expected);
          });
        });
    });

    it('snap file and snap exists', () => {
      const expected = 'exports[`snap-1`] = `\n{\n  "a": 1,\n  "b": 3,\n  "c": 3\n}\n`;\n\nexports[`snap-2`] = `\ntest-2\n`;\n';

      cy.task('testing:callMethod', { method, filePath, snapshotTitle: 'snap-2', subject: 'test-2' })
        .then(() => {
          cy.readFile(filePath).then((contents) => {
            expect(contents).to.equal(expected);
          });
        });
    });

    after(()=> {
      cy.task('testing:deleteFiles', filePath);
    });
  });
});