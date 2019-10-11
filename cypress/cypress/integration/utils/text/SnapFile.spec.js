const path = require('path');

describe('SnapFile', () => {
  const filePath = path.join(path.dirname(Cypress.spec.absolute), '__snapshots__', 'SnapFile.snap');

  describe('saveSnapFile', () => {
    const method = 'saveSnapFile';
    const snapshots = {
      "snap-1": "test",
      "snap-2": "test"
    };

    const expected = 'exports[`snap-1`] = `\ntest\n`;\n\nexports[`snap-2`] = `\ntest\n`;\n';

    it('snap file doesnt exist', () => {    
      cy.task('testing:callMethod', { method, snapshots, filePath })
        .then(() => {
          cy.readFile(filePath).should('exist').then((contents) => {
            expect(contents).to.equal(expected);
          })
        });
    });

    it('snap file does exist', () => {
      cy.task('testing:callMethod', { method, snapshots, filePath })
        .then(() => {
          cy.readFile(filePath).should('exist').then((contents) => {
            expect(contents).to.equal(expected);
          })
        });
    });
  });

  describe('readSnapFile', () => {
    const method = 'readSnapFile';

    it('snap file doesnt exist', () => {
      cy.task('testing:callMethod', { method, filePath: '../path/doesnt/exist.snap'})
      .then((result) => {
        expect(result).to.deep.equal({});
      });
    });

    it('snap file does exist', () => {
      cy.task('testing:callMethod', { method, filePath })
        .then((result) => {
          const expected = {
            "snap-1": "\ntest\n",
            "snap-2": "\ntest\n"
          };
          expect(result).to.deep.equal(expected);
        });
    });
  });

  after(() => {
    cy.task('testing:deleteFiles', filePath);
  });
});