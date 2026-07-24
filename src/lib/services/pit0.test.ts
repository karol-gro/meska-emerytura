import { describe, expect, it } from 'vitest';
import type { ContractType } from '$lib/models/pit0';
import {
	calculatePit0,
	clampPit0,
	DEFAULT_PIT0_INPUTS,
	GROSS_RANGE,
	pitByScale,
	validatePit0
} from './pit0';

/** Oczekiwane wartości z tabel docs/PIT-0-PRZYKLAD.md */
interface Row {
	gross: number;
	pitMan: number;
	pitWoman: number;
	netMan: number;
	netWoman: number;
	diff: number;
	genderTax: number;
	total5: number;
}

// Umowa o pracę
const UOP: Row[] = [
	{ gross: 4000, pitMan: 1010, pitWoman: 0, netMan: 3056.79, netWoman: 3140.96, diff: 84.17, genderTax: 0.0268, total5: 5050 }, // prettier-ignore
	{ gross: 6000, pitMan: 3495, pitWoman: 0, netMan: 4420.18, netWoman: 4711.43, diff: 291.25, genderTax: 0.0618, total5: 17475 }, // prettier-ignore
	{ gross: 8000, pitMan: 5981, pitWoman: 0, netMan: 5783.50, netWoman: 6281.91, diff: 498.42, genderTax: 0.0793, total5: 29905 }, // prettier-ignore
	{ gross: 10000, pitMan: 8466, pitWoman: 0, netMan: 7146.89, netWoman: 7852.39, diff: 705.50, genderTax: 0.0898, total5: 42330 }, // prettier-ignore
	{ gross: 15000, pitMan: 21143, pitWoman: 5822, netMan: 10016.67, netWoman: 11293.42, diff: 1276.75, genderTax: 0.1131, total5: 76605 } // prettier-ignore
];

// Umowa zlecenie (bez dobrowolnej chorobowej)
const ZLEC: Row[] = [
	{ gross: 4000, pitMan: 489, pitWoman: 0, netMan: 3189.39, netWoman: 3230.14, diff: 40.75, genderTax: 0.0126, total5: 2445 }, // prettier-ignore
	{ gross: 6000, pitMan: 2534, pitWoman: 0, netMan: 4634.04, netWoman: 4845.20, diff: 211.17, genderTax: 0.0436, total5: 12670 }, // prettier-ignore
	{ gross: 8000, pitMan: 4578, pitWoman: 0, netMan: 6078.77, netWoman: 6460.27, diff: 381.50, genderTax: 0.0591, total5: 22890 }, // prettier-ignore
	{ gross: 10000, pitMan: 6623, pitWoman: 0, netMan: 7523.42, netWoman: 8075.34, diff: 551.92, genderTax: 0.0683, total5: 33115 }, // prettier-ignore
	{ gross: 15000, pitMan: 13292, pitWoman: 4448, netMan: 11005.34, netWoman: 11742.34, diff: 737.0, genderTax: 0.0628, total5: 44220 } // prettier-ignore
];

function checkRow(contract: ContractType, row: Row) {
	const r = calculatePit0({ grossSalary: row.gross, contract });
	expect(r.pitMan).toBe(row.pitMan);
	expect(r.pitWoman).toBe(row.pitWoman);
	expect(r.netMan).toBeCloseTo(row.netMan, 2);
	expect(r.netWoman).toBeCloseTo(row.netWoman, 2);
	expect(r.monthlyDifference).toBeCloseTo(row.diff, 2);
	expect(r.genderTax).toBeCloseTo(row.genderTax, 3);
	expect(r.total5Years).toBeCloseTo(row.total5, 2);
}

describe('calculatePit0 – tabela umowy o pracę (docs/PIT-0-PRZYKLAD.md)', () => {
	for (const row of UOP) {
		it(`brutto ${row.gross} zł`, () => checkRow('uop', row));
	}
});

describe('calculatePit0 – tabela umowy zlecenia (docs/PIT-0-PRZYKLAD.md)', () => {
	for (const row of ZLEC) {
		it(`brutto ${row.gross} zł`, () => checkRow('zlec', row));
	}
});

describe('calculatePit0 – przykład szczegółowy §9 (UoP 8 000 zł)', () => {
	const r = calculatePit0({ grossSalary: 8000, contract: 'uop' });

	it('składki i zdrowotna są identyczne dla obu płci (różni je tylko PIT)', () => {
		expect(r.socialContributions).toBeCloseTo(13161.6, 2);
		expect(r.healthContribution).toBeCloseTo(7455.46, 2);
	});

	it('kobieta z ulgą nie płaci PIT – kwota wolna pokrywa nadwyżkę ponad limit', () => {
		expect(r.pitWoman).toBe(0);
	});

	it('różnica miesięczna = (PIT_M − PIT_K) / 12, a suma 5 lat = różnica × 60', () => {
		expect(r.monthlyDifference).toBeCloseTo((r.pitMan - r.pitWoman) / 12, 6);
		expect(r.total5Years).toBeCloseTo(r.monthlyDifference * 60, 6);
	});

	it('nie zgłasza żadnych ostrzeżeń przy typowej pensji', () => {
		expect(r.warnings).toEqual([]);
	});
});

describe('calculatePit0 – przypadki brzegowe (§8)', () => {
	it('bardzo niska pensja: kwota wolna zeruje PIT obu płci → NO_DIFFERENCE, różnica 0', () => {
		const r = calculatePit0({ grossSalary: 1000, contract: 'uop' });
		expect(r.pitMan).toBe(0);
		expect(r.pitWoman).toBe(0);
		expect(r.monthlyDifference).toBe(0);
		expect(r.genderTax).toBe(0);
		expect(r.warnings).toContain('NO_DIFFERENCE');
	});

	it('pensja powyżej 30-krotności: emerytalna+rentowa liczone tylko do limitu, bez ostrzeżenia', () => {
		// 30 000 × 12 = 360 000 > 282 600
		const r = calculatePit0({ grossSalary: 30000, contract: 'uop' });
		// emerytalna+rentowa (11,26%) od limitu 282 600 + chorobowa (2,45%) od pełnych 360 000
		const expectedSocial = 0.1126 * 282600 + 0.0245 * 360000;
		expect(r.socialContributions).toBeCloseTo(expectedSocial, 2);
		expect(r.warnings).toEqual([]);
		// symetria zachowana: różnica nadal wynika wyłącznie z PIT
		expect(r.monthlyDifference).toBeCloseTo((r.pitMan - r.pitWoman) / 12, 6);
	});

	it('cały przychód kobiety poniżej limitu ulgi → PIT_K = 0', () => {
		const r = calculatePit0({ grossSalary: 7000, contract: 'uop' });
		expect(r.grossAnnual).toBeLessThanOrEqual(85528);
		expect(r.pitWoman).toBe(0);
	});
});

describe('pitByScale – podatek wg skali z zaokrągleniem do pełnych złotych', () => {
	it('kwota wolna zeruje podatek do podstawy 30 000 zł', () => {
		expect(pitByScale(30000)).toBe(0);
		expect(pitByScale(29999)).toBe(0);
	});

	it('pierwszy próg (12% minus kwota zmniejszająca)', () => {
		// 79 838 × 12% − 3 600 = 5 980,56 → 5 981
		expect(pitByScale(79838.4)).toBe(5981);
	});

	it('drugi próg (32% powyżej 120 000 zł)', () => {
		// 152 322: 14 400 + 32% × 32 322 − 3 600 = 21 143,04 → 21 143
		expect(pitByScale(152322)).toBe(21143);
	});

	it('ujemna podstawa → 0 (bez ujemnego podatku)', () => {
		expect(pitByScale(-5000)).toBe(0);
	});
});

describe('validatePit0 i clampPit0', () => {
	it('akceptuje poprawne wejścia', () => {
		expect(validatePit0({ grossSalary: 8000, contract: 'uop' })).toBe(true);
		expect(validatePit0({ grossSalary: 8000, contract: 'zlec' })).toBe(true);
	});

	it('odrzuca pensję poza zakresem i nieznaną formę umowy', () => {
		expect(validatePit0({ grossSalary: 500, contract: 'uop' })).toBe(false);
		expect(validatePit0({ grossSalary: 8000, contract: 'x' as ContractType })).toBe(false);
	});

	it('przycina pensję do zakresu suwaka', () => {
		expect(clampPit0({ grossSalary: 500, contract: 'uop' }).grossSalary).toBe(GROSS_RANGE.min);
		expect(clampPit0({ grossSalary: 999999, contract: 'uop' }).grossSalary).toBe(GROSS_RANGE.max);
	});

	it('nieliczbową pensję i nieznaną umowę sprowadza do domyślnych', () => {
		const c = clampPit0({ grossSalary: NaN, contract: 'x' as ContractType });
		expect(c.grossSalary).toBe(DEFAULT_PIT0_INPUTS.grossSalary);
		expect(c.contract).toBe(DEFAULT_PIT0_INPUTS.contract);
	});
});
