import { describe, expect, it } from 'vitest';
import type { CalculatorInputs, YearMonth } from '$lib/models/inputs';
import { decode, encode } from './codec';
import { DEFAULT_ASSUMPTIONS, defaultInputs } from './constants';

const NOW: YearMonth = { year: 2026, month: 6 };

describe('encode', () => {
	it('produkuje kompaktowy, czytelny format v2', () => {
		const inputs: CalculatorInputs = {
			birthYear: 1996,
			birthMonth: 9,
			netSalary: 8000,
			replacementRate: 0.5,
			returnAccum: 0.06,
			returnPayout: 0.035,
			inflation: 0.025,
			contributionValorization: 0.045,
			pensionValorization: 0.04,
			lifeExpectancyReduction: 0.13
		};
		expect(encode(inputs)).toBe('2_1996_9_8000_50_6_3.5_2.5_4.5_4_13');
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
				inflation: 0,
				contributionValorization: 0.05,
				pensionValorization: 0.0425,
				lifeExpectancyReduction: 0.1
			},
			{
				birthYear: 2008,
				birthMonth: 1,
				netSalary: 1,
				replacementRate: 0.2,
				returnAccum: 0,
				returnPayout: 0.15,
				inflation: 0.1,
				contributionValorization: 0.15,
				pensionValorization: 0,
				lifeExpectancyReduction: 0.3
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

describe('decode – odporność na błędne wejście', () => {
	const valid = encode(defaultInputs(NOW));

	it('zwraca null dla śmieciowych stringów', () => {
		for (const junk of [
			'',
			'garbage',
			'1_2_3',
			'1_a_b_c_d_e_f_g',
			'null',
			'2_1996_9_8000_50_6_3.5_2.5', // v2 – za mało pól (brak 3 nowych)
			'1_1996_9_8000_50_6_3.5' // v1 – za mało pól
		]) {
			expect(decode(junk, NOW)).toBeNull();
		}
	});

	it('zwraca null dla nieznanej wersji', () => {
		expect(decode(valid.replace(/^2_/, '3_'), NOW)).toBeNull();
	});

	it('dekoduje stary link v1 – brakujące założenia uzupełnia domyślnymi', () => {
		const decoded = decode('1_1996_9_8000_50_6_3.5_2.5', NOW);
		expect(decoded).not.toBeNull();
		expect(decoded).toMatchObject({
			birthYear: 1996,
			birthMonth: 9,
			netSalary: 8000,
			replacementRate: 0.5,
			contributionValorization: DEFAULT_ASSUMPTIONS.contributionValorization,
			pensionValorization: DEFAULT_ASSUMPTIONS.pensionValorization,
			lifeExpectancyReduction: DEFAULT_ASSUMPTIONS.lifeExpectancyReduction
		});
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
