import { describe, expect, it } from 'vitest';
import type { Pit0Inputs } from '$lib/models/pit0';
import { decode, encode } from './pit0-codec';

describe('codec PIT-0 – round-trip', () => {
	const cases: Pit0Inputs[] = [
		{ grossSalary: 8000, contract: 'uop' },
		{ grossSalary: 12500, contract: 'zlec' },
		{ grossSalary: 1000, contract: 'uop' },
		{ grossSalary: 60000, contract: 'zlec' },
		{ grossSalary: 15000, contract: 'b2b-ryczalt', ryczaltRate: 0.12 },
		{ grossSalary: 30000, contract: 'b2b-ryczalt', ryczaltRate: 0.055 },
		{ grossSalary: 8000, contract: 'b2b-ryczalt', ryczaltRate: 0.17 }
	];

	for (const inputs of cases) {
		it(`${inputs.grossSalary} zł / ${inputs.contract}`, () => {
			expect(decode(encode(inputs))).toEqual(inputs);
		});
	}
});

describe('codec PIT-0 – zgodność wsteczna i format B2B', () => {
	it('dawny 3-polowy link (uop/zlec) dekoduje się bez stawki', () => {
		expect(decode('1_8000_uop')).toEqual({ grossSalary: 8000, contract: 'uop' });
		expect(decode('1_12500_zlec')).toEqual({ grossSalary: 12500, contract: 'zlec' });
	});

	it('uop/zlec nie doklejają 4. pola stawki', () => {
		expect(encode({ grossSalary: 8000, contract: 'uop' })).toBe('1_8000_uop');
	});

	it('B2B zapisuje stawkę jako 4. pole', () => {
		expect(encode({ grossSalary: 15000, contract: 'b2b-ryczalt', ryczaltRate: 0.12 })).toBe(
			'1_15000_b2b-ryczalt_0.12'
		);
	});
});

describe('codec PIT-0 – odporność na śmieciowe wejście', () => {
	for (const garbage of [
		'',
		'2_8000_uop', // zła wersja
		'1_8000', // za mało pól
		'1_8000_uop_extra', // 4. pole nie-liczba
		'1_8000_b2b-ryczalt_abc', // stawka nie-liczba
		'1_8000_uop_0.12_x', // za dużo pól
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
