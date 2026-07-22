import { describe, expect, it } from 'vitest';
import { yearWord } from './format';

describe('yearWord', () => {
	it('używa „rok" dla 1', () => {
		expect(yearWord(1)).toBe('rok');
	});

	it('używa „lata" dla liczb kończących się na 2–4 (poza 12–14)', () => {
		for (const n of [2, 3, 4, 22, 23, 24, 34, 43, 54, 62]) {
			expect(yearWord(n)).toBe('lata');
		}
	});

	it('używa „lat" dla pozostałych, w tym 12–14 i wielokrotności', () => {
		for (const n of [0, 5, 11, 12, 13, 14, 20, 25, 60, 65]) {
			expect(yearWord(n)).toBe('lat');
		}
	});
});
