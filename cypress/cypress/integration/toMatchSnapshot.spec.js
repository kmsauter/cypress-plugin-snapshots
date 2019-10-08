describe('toMatchSnapshot', () => {
  it('toMatchSnapshot - json', () => {
    cy.request('/static/stub.json')
      .its('body')
      .toMatchSnapshot();
  });

  it('toMatchSnapshot - html', () => {
    cy.visit('/static/stub.html')
      .then(() => {
        cy.get('[data-test=test]').toMatchSnapshot();
      });
  });

  it('toMatchSnapshot - html escaping', () => {
    cy.visit('/static/input.html')
      .then(() => {
        cy.get('#input-element').toMatchSnapshot();
      });
  });

  it('toMatchSnapshot - normalizeJson: false', () => {
    const obj = {
      d: 1,
      a: 5,
      k: [1, 2, 'k', 'a', null, undefined],
      q: {
        'j': 'k',
        'b': 3,
        o: ['o', 1, { a: 1 }, null, undefined],
        p: null,
        y: undefined
      },
      t: null,
      e: undefined
    };

    cy.wrap(obj).toMatchSnapshot({
      "normalizeJson": false
    });
  });

  it('toMatchSnapshot - update', () => {
    cy.wrap(Date.now()).toMatchSnapshot({
      updateSnapshots: true
    });
  });
});
