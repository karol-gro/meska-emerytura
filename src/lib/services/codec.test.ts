import { describe, expect, it } from 'vitest';
import type { CalculatorInputs, YearMonth } from '$lib/models/inputs';
import { decode, encode } from './codec';
import { defaultInputs } from './constants';

const NOW: YearMonth = { year: 2026, month: 6 };

describe('encode', () => {
	it('produkuje kompaktowy, czytelny format v1', () => {
		const inputs: CalculatorInputs = {
			birthYear: 1996,
			birthMonth: 9,
			netSalary: 8000,
			replacementRate: 0.5,
			returnAccum: 0.06,
			returnPayout: 0.035,
			inflation: 0.025
		};
		expect(encode(inputs)).toBe('1_1996_9_8000_50_6_3.5_2.5');
	});

	it('nie zostawia artefaktów zmiennoprzecinkowych w procentach', () => {
		const encoded = encode({ ...defaultInputs(NOW), returnAccum: 0.07 });
		expect(encoded).toContain('_7_');
	});
});

describe('round-trip', () => {
	it('decode(encode(x)) odtwarza wejścia', () => {
		const cases: CalculatorInputs[] = [
			defaultInputs(NOW),
			{
				birthYear: 1970,
				birthMonth: 12,
				netSalary: 12345.67,
				replacementRate: 0.75,
				returnAccum: 0.081,
				returnPayout: 0.0425,
				inflation: 0
			},
			{
				birthYear: 2008,
				birthMonth: 1,
				netSalary: 1,
				replacementRate: 0.2,
				returnAccum: 0,
				returnPayout: 0.15,
				inflation: 0.1
			}
		];
		for (const inputs of cases) {
			const decoded = decode(encode(inputs), NOW);
			expect(decoded).not.toBeNull();
			for (const key of Object.keys(inputs) as (keyof CalculatorInputs)[]) {
				expect(decoded![key]).toBeCloseTo(inputs[key], 6);
			}
		}
	});
});

describe('decode — odporność na błędne wejście', () => {
	const valid = encode(defaultInputs(NOW));

	it('zwraca null dla śmieciowych stringów', () => {
		for (const junk of [
			'',
			'garbage',
			'1_2_3',
			'1_a_b_c_d_e_f_g',
			'null',
			'1_1996_9_8000_50_6_3.5' // za mało pól
		]) {
			expect(decode(junk, NOW)).toBeNull();
		}
	});

	it('zwraca null dla nieznanej wersji', () => {
		expect(decode(valid.replace(/^1_/, '2_'), NOW)).toBeNull();
	});

	it('zwraca null dla wartości poza zakresem', () => {
		expect(decode('1_1996_9_8000_50_99_3.5_2.5', NOW)).toBeNull(); // r_a = 99%
		expect(decode('1_1996_9_-5_50_6_3.5_2.5', NOW)).toBeNull(); // pensja ujemna
		expect(decode('1_1996_13_8000_50_6_3.5_2.5', NOW)).toBeNull(); // miesiąc 13
		expect(decode(`1_${NOW.year - 10}_6_8000_50_6_3.5_2.5`, NOW)).toBeNull(); // wiek 10
	});

	it('zwraca null dla nadmiarowych pól', () => {
		expect(decode(valid + '_42', NOW)).toBeNull();
	});

	it('akceptuje poprawny string', () => {
		expect(decode(valid, NOW)).toEqual(defaultInputs(NOW));
	});
});
