const { normalizeObject } = require('../../../src/utils/text/json');

describe('normalizeJson', () => {
	it('normalizeJson', () => {
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
	
		expect(normalizeObject(obj)).toEqual(expected);
	});
});