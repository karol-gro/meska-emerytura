import { describe, expect, it } from 'vitest';
import type { CzasZyciaInputs } from '$lib/models/czas-zycia';
import { decode, encode } from './czas-zycia-codec';

describe('codec czas-zycia – round-trip', () => {
	const cases: CzasZyciaInputs[] = [
		{ monthlyPension: 4_500, age: 65, pensionValorization: 0.04, inflation: 0.025 },
		{ monthlyPension: 1_000, age: 60, pensionValorization: 0, inflation: 0 },
		{ monthlyPension: 20_000, age: 80, pensionValorization: 0.15, inflation: 0.1 },
		{ monthlyPension: 8_123.45, age: 72, pensionValorization: 0.0325, inflation: 0.017 }
	];

	for (const inputs of cases) {
		it(`${inputs.monthlyPension} zł, wiek ${inputs.age}, wal_e ${inputs.pensionValorization}, i ${inputs.inflation}`, () => {
			expect(decode(encode(inputs))).toEqual(inputs);
		});
	}
});

describe('codec czas-zycia – format', () => {
	it('koduje jako 1_<E>_<w>_<walE%>_<i%>', () => {
		expect(
			encode({ monthlyPension: 4_500, age: 65, pensionValorization: 0.04, inflation: 0.025 })
		).toBe('1_4500_65_4_2.5');
	});
});

describe('codec czas-zycia – odporność na śmieciowe wejście', () => {
	for (const garbage of [
		'',
		'2_4500_65_4_2.5', // zła wersja
		'1_4500_65_4', // za mało pól
		'1_4500_65_4_2.5_extra', // za dużo pól
		'1_abc_65_4_2.5', // pensja nie-liczba
		'1_4500_abc_4_2.5', // wiek nie-liczba
		'1_4500_65_abc_2.5', // waloryzacja nie-liczba
		'1_500_65_4_2.5', // pensja poniżej zakresu
		'1_999999_65_4_2.5', // pensja powyżej zakresu
		'1_4500_59_4_2.5', // wiek poniżej zakresu
		'1_4500_81_4_2.5', // wiek powyżej zakresu
		'1_4500_65.5_4_2.5', // wiek niecałkowity
		'1_4500_65_-1_2.5', // waloryzacja poniżej zakresu
		'1_4500_65_20_2.5' // waloryzacja powyżej zakresu
	]) {
		it(`odrzuca: "${garbage}"`, () => {
			expect(decode(garbage)).toBeNull();
		});
	}
});
