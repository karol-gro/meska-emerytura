import { describe, expect, it } from 'vitest';
import { lifeTableRow, LIFE_TABLE } from './life-tables';

describe('LIFE_TABLE – wartości potwierdzone (docs/CZAS-ZYCIA-ALGORYTM.md §4)', () => {
	it('wiek 60: e_U 268,9 / e_M 240,0 / e_K 296,4 mies.', () => {
		expect(LIFE_TABLE[60]).toEqual({ unisex: 268.9, male: 240.0, female: 296.4 });
	});
});

describe('LIFE_TABLE – niezmiennik e_M < e_U < e_K (§7, krok 0)', () => {
	for (const [age, row] of Object.entries(LIFE_TABLE)) {
		it(`wiek ${age}`, () => {
			expect(row.male).toBeLessThan(row.unisex);
			expect(row.unisex).toBeLessThan(row.female);
		});
	}
});

describe('lifeTableRow', () => {
	it('zwraca wiersz dla wieku 60', () => {
		expect(lifeTableRow(60)).toEqual({ unisex: 268.9, male: 240.0, female: 296.4 });
	});

	it('rzuca dla wieku bez danych', () => {
		expect(() => lifeTableRow(61)).toThrow();
	});
});
