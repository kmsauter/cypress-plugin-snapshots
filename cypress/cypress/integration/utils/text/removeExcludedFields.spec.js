const _ = require('lodash');
const removeExcludedFields = require('../../../../../src/utils/text/removeExcludedFields');

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
		var obj = _.cloneDeep(objOriginal);
		var result = removeExcludedFields(obj, 5);
		expect(result).to.deep.equal(objOriginal);
	});

	it('empty array', () => {
		var obj = _.cloneDeep(objOriginal);
		var result = removeExcludedFields(obj, []);
		expect(result).to.deep.equal(objOriginal);
	});

	it('removes fields - object', () => {
		var obj = _.cloneDeep(objOriginal);
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
})