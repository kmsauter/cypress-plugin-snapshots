const keepKeysFromExpected = require('../../../../src/utils/text/keepKeysFromExpected');

describe('keepKeysFromExpected', () => {
  const expected = {
    field: 'value',
    undefined: undefined,
    null: null,
    items: [
      { name: 'item1', items: [{ name: 'subitem1' }] },
      { name: 'item2' },
      { name: 'item3' },
      { name: null },
      { name: undefined },
      null,
      undefined,
    ],
  };

  it('ignoreExtraFields: false, ignoreExtraArrayItems: false', () => {
    const config = {
      ignoreExtraFields: false,
      ignoreExtraArrayItems: false,
    };

    const actual = {
      field: 'value',
      undefined: undefined,
      null: null,
      extra: 'extra',
      extraUndefined: undefined,
      extraNull: null,
      items: [
        {
          name: 'item1',
          items: [
            { name: 'subitem1', extra: 'extra1' },
            {
              name: 'subitem2',
              extra: 'extra2',
              undefined: undefined,
              null: null,
              extraUndefined: undefined,
              extraNull: null,
            },
            null,
            undefined,
          ],
        },
        { name: 'item2' },
        { name: 'item3' },
        { name: null },
        { name: undefined },
        null,
        undefined,
        { name: 'item4' },
        { name: null },
        { name: undefined },
      ],
    };

    const result = keepKeysFromExpected(actual, expected, config);
    expect(result).to.deep.equal(actual);
  });

  it('ignoreExtraFields: true, ignoreExtraArrayItems: true', () => {
    const config = {
      ignoreExtraFields: true,
      ignoreExtraArrayItems: true
    };

    const actual = {
      field: 'value',
      undefined: undefined,
      null: null,
      extra: 'extra',
      extraUndefined: undefined,
      extraNull: null,
      items: [
        {
          name: 'item1',
          items: [
            { name: 'subitem1', extra: 'extra1' },
            {
              name: 'subitem2',
              extra: 'extra2',
              undefined: undefined,
              null: null,
              extraUndefined: undefined,
              extraNull: null,
            },
            null,
            undefined,
          ],
        },
        { name: 'item2' },
        { name: 'item3' },
        { name: null },
        { name: undefined },
        null,
        undefined,
        { name: 'item4' },
        { name: null },
        { name: undefined },
      ],
    };

    const result = keepKeysFromExpected(actual, expected, config);
    expect(result).to.deep.equal(expected);

    cy.wrap(actual).toMatchSnapshot(config);
  });

  it('ignoreExtraFields: false, ignoreExtraArrayItems: true', () => {
    const config ={
      ignoreExtraFields: false,
      ignoreExtraArrayItems: true
    };
    const actual = {
      field: 'value',
      undefined: undefined,
      null: null,
      items: [
        {
          name: 'item1',
          items: [
            { name: 'subitem1' },
            {
              name: 'subitem2',
              extra: 'extra2',
              undefined: undefined,
              null: null,
              extraUndefined: undefined,
              extraNull: null,
            },
            null,
            undefined,
          ],
        },
        { name: 'item2' },
        { name: 'item3' },
        { name: null },
        { name: undefined },
        null,
        undefined,
        { name: 'item4' },
        { name: null },
        { name: undefined },
      ],
    };

    const result = keepKeysFromExpected(actual, expected, config);
    expect(result).to.deep.equal(expected);

    cy.wrap(actual).toMatchSnapshot(config);
  });

  it('ignoreExtraFields: true, ignoreExtraArrayItems: false', () => {
    const config = {
      ignoreExtraFields: true,
      ignoreExtraArrayItems: false
    };

    const actual = {
      field: 'value',
      undefined: undefined,
      null: null,
      extra: 'extra',
      extraUndefined: undefined,
      extraNull: null,
      items: [
        {
          name: 'item1',
          items: [{ name: 'subitem1', extra: 'extra1'}],
        },
        { name: 'item2' },
        { name: 'item3' },
        { name: null },
        { name: undefined },
        null,
        undefined
      ],
    };

    const result = keepKeysFromExpected(actual, expected, config);
    expect(result).to.deep.equal(expected);

    cy.wrap(actual).toMatchSnapshot(config);
  });

  it.skip('alt - ignoreExtraFields: true, ignoreExtraArrayItems: true', () => {
    const config = {
      ignoreExtraFields: true,
      ignoreExtraArrayItems: true
    };

    const actual = {
      // field: 'value',
      undefined: undefined,
      null: null,
      extra: 'extra',
      extraUndefined: undefined,
      extraNull: null,
      items: [
        {
          name: 'item1',
          items: [
            { name: 'subitem1', extra: 'extra1' },
            {
              name: 'subitem2',
              extra: 'extra2',
              undefined: undefined,
              null: null,
              extraUndefined: undefined,
              extraNull: null,
            },
            null,
            undefined,
          ],
        },
        { name: 'item5' },
        { name: 'item2' },
        // { name: 'item3' },
        { name: null },
        { name: undefined },
        null,
        undefined,
        { name: 'item4' },
        { name2: null },
        { name2: undefined },
      ],
    };

    const expected2 = {
      // field: 'value',
      undefined: undefined,
      null: null,
      items: [
        { name: 'item1', items: [{ name: 'subitem1' }] },
        { name: 'item2' },
        // { name: 'item3' },
        { name: null },
        { name: undefined },
        null,
        undefined,
      ],
    };


    const result = keepKeysFromExpected(actual, expected2, config);
    expect(result).to.deep.equal(expected2);
  });
});
