import { describe, expect, it } from 'vitest';
import type { CzasZyciaInputs } from '$lib/models/czas-zycia';
import { decode, encode } from './czas-zycia-codec';

describe('codec czas-zycia – round-trip', () => {
	const cases: CzasZyciaInputs[] = [
		{ monthlyPension: 4_500, pensionValorization: 0.04, inflation: 0.025 },
		{ monthlyPension: 1_000, pensionValorization: 0, inflation: 0 },
		{ monthlyPension: 20_000, pensionValorization: 0.15, inflation: 0.1 },
		{ monthlyPension: 8_123.45, pensionValorization: 0.0325, inflation: 0.017 }
	];

	for (const inputs of cases) {
		it(`${inputs.monthlyPension} zł, wal_e ${inputs.pensionValorization}, i ${inputs.inflation}`, () => {
			expect(decode(encode(inputs))).toEqual(inputs);
		});
	}
});

describe('codec czas-zycia – format', () => {
	it('koduje jako 1_<E>_<walE%>_<i%>', () => {
		expect(encode({ monthlyPension: 4_500, pensionValorization: 0.04, inflation: 0.025 })).toBe(
			'1_4500_4_2.5'
		);
	});
});

describe('codec czas-zycia – odporność na śmieciowe wejście', () => {
	for (const garbage of [
		'',
		'2_4500_4_2.5', // zła wersja
		'1_4500_4', // za mało pól
		'1_4500_4_2.5_extra', // za dużo pól
		'1_abc_4_2.5', // pensja nie-liczba
		'1_4500_abc_2.5', // waloryzacja nie-liczba
		'1_500_4_2.5', // pensja poniżej zakresu
		'1_999999_4_2.5', // pensja powyżej zakresu
		'1_4500_-1_2.5', // waloryzacja poniżej zakresu
		'1_4500_20_2.5' // waloryzacja powyżej zakresu
	]) {
		it(`odrzuca: "${garbage}"`, () => {
			expect(decode(garbage)).toBeNull();
		});
	}
});
