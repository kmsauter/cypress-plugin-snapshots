const { cloneDeep } = require('lodash');
const { runSuites, dataFormatted } = require('../../../fixtures/data-types');
const { 
  isHtml, getSubject, normalizeObject, removeExcludedFields 
} = require('../../../../../src/utils/text/utils');

describe('utils', () => {
  runSuites('isHtml', function (item, itemName, suiteName) {
    expect(isHtml(item)).to.equal(suiteName == 'html');
  });

  runSuites('getSubject', function (item, itemName, suiteName) {
    var expected = suiteName == 'html' ? dataFormatted[suiteName][itemName].replace(/\n/g, '') : item;
    expect(getSubject(item)).to.equal(expected);
  });

  describe('normalizeObject', () => {
    it('normalizeObject', () => {
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

      const expected = {
        a: 5,
        d: 1,
        e: undefined,
        k: [1, 2, 'k', 'a', null, undefined],
        q: {
          'b': 3,
          'j': 'k',
          o: ['o', 1, { a: 1 }, null, undefined],
          p: null,
          y: undefined
        },
        t: null
      };

      expect(normalizeObject(obj)).to.deep.equal(expected);
    });
  });

  describe('removeExcludedFields', () => {
    const objOriginal = {
      a: 1,
      b: 2,
      c: {
        b: 5,
        d: 7
      },
      d: [1, 'a', { a: 1, b: 2 }]
    };

    it('fields not array', () => {
      var obj = cloneDeep(objOriginal);
      var result = removeExcludedFields(obj, 5);
      expect(result).to.deep.equal(objOriginal);
    });

    it('empty array', () => {
      var obj = cloneDeep(objOriginal);
      var result = removeExcludedFields(obj, []);
      expect(result).to.deep.equal(objOriginal);
    });

    it('removes fields - object', () => {
      var obj = cloneDeep(objOriginal);
      var result = removeExcludedFields(obj, ['b']);
      const expected = {
        a: 1,
        c: {
          d: 7
        },
        d: [1, 'a', { a: 1 }]
      }
      expect(result).to.deep.equal(expected);
    });

    it('removes fields - array', () => {
      var obj = [1, 'a', { a: 1, b: 2 }];

      var result = removeExcludedFields(obj, ['b']);
      const expected = [1, 'a', { a: 1 }];

      expect(result).to.deep.equal(expected);
    });
  });
});