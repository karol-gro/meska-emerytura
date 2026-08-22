import { describe, expect, it } from 'vitest';
import { lifeTableRow, LIFE_TABLE } from './life-tables';

describe('LIFE_TABLE – wartości potwierdzone (docs/CZAS-ZYCIA-ALGORYTM.md §4)', () => {
	it('wiek 60: e_U 268,9 / e_M 240,48 / e_K 296,52 mies.', () => {
		expect(LIFE_TABLE[60]).toEqual({ unisex: 268.9, male: 240.48, female: 296.52 });
	});

	it('wiek 65: e_U 222,7 / e_M 198,0 / e_K 245,64 mies.', () => {
		expect(LIFE_TABLE[65]).toEqual({ unisex: 222.7, male: 198, female: 245.64 });
	});

	it('wiek 80: e_U 106,4 / e_M 95,16 / e_K 114,48 mies.', () => {
		expect(LIFE_TABLE[80]).toEqual({ unisex: 106.4, male: 95.16, female: 114.48 });
	});
});

describe('LIFE_TABLE – kompletność zakresu 60–80 (§2 AGE_RANGE)', () => {
	it('ma wiersz dla każdego wieku 60–80', () => {
		for (let age = 60; age <= 80; age++) {
			expect(LIFE_TABLE[age], `brak wiersza dla wieku ${age}`).toBeDefined();
		}
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

describe('LIFE_TABLE – monotoniczność (im starszy wiek, tym mniej miesięcy)', () => {
	it('e_U, e_M, e_K maleją wraz z wiekiem', () => {
		const ages = Object.keys(LIFE_TABLE)
			.map(Number)
			.sort((a, b) => a - b);
		for (let i = 1; i < ages.length; i++) {
			const prev = LIFE_TABLE[ages[i - 1]];
			const curr = LIFE_TABLE[ages[i]];
			expect(curr.unisex).toBeLessThan(prev.unisex);
			expect(curr.male).toBeLessThan(prev.male);
			expect(curr.female).toBeLessThan(prev.female);
		}
	});
});

describe('lifeTableRow', () => {
	it('zwraca wiersz dla wieku w zakresie', () => {
		expect(lifeTableRow(65)).toEqual({ unisex: 222.7, male: 198, female: 245.64 });
	});

	it('rzuca dla wieku poza zakresem', () => {
		expect(() => lifeTableRow(59)).toThrow();
		expect(() => lifeTableRow(81)).toThrow();
	});
});
