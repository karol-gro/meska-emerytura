import { describe, expect, it } from 'vitest';
import type { Pit0Inputs } from '$lib/models/pit0';
import { decode, encode } from './pit0-codec';

describe('codec PIT-0 – round-trip', () => {
	const cases: Pit0Inputs[] = [
		{ grossSalary: 8000, contract: 'uop' },
		{ grossSalary: 12500, contract: 'zlec' },
		{ grossSalary: 1000, contract: 'uop' },
		{ grossSalary: 60000, contract: 'zlec' }
	];

	for (const inputs of cases) {
		it(`${inputs.grossSalary} zł / ${inputs.contract}`, () => {
			expect(decode(encode(inputs))).toEqual(inputs);
		});
	}
});

describe('codec PIT-0 – odporność na śmieciowe wejście', () => {
	for (const garbage of [
		'',
		'2_8000_uop', // zła wersja
		'1_8000', // za mało pól
		'1_8000_uop_extra', // za dużo pól
		'1_abc_uop', // pensja nie-liczba
		'1_8000_umowa', // nieznana forma
		'1_500_uop', // pensja poniżej zakresu
		'1_999999_uop' // pensja powyżej zakresu
	]) {
		it(`odrzuca: "${garbage}"`, () => {
			expect(decode(garbage)).toBeNull();
		});
	}
});
