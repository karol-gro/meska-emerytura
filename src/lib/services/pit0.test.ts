import { describe, expect, it } from 'vitest';
import type { ContractType } from '$lib/models/pit0';
import {
	B2B_ZDROW_BASE,
	B2B_ZUS_BASE,
	calculatePit0,
	clampPit0,
	DEFAULT_PIT0_INPUTS,
	DEFAULT_RYCZALT_RATE,
	GROSS_RANGE,
	pitByScale,
	RYCZALT_RANGE,
	SKL_EMERYT_B2B,
	SKL_RENT_B2B,
	SKL_WYPADK_B2B,
	SKL_ZDROWOTNA,
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

// B2B na ryczałcie, stawka 12% (domyślna). Kobieta płaci ryczałt od nadwyżki ponad limit
// od razu – ryczałt nie ma kwoty wolnej, więc PIT_K > 0 już przy niższych przychodach niż na skali.
const B2B_RYCZALT_12: Row[] = [
	{ gross: 5000, pitMan: 4465, pitWoman: 0, netMan: 2479.75, netWoman: 2851.83, diff: 372.08, genderTax: 0.1305, total5: 22325 }, // prettier-ignore
	{ gross: 8000, pitMan: 8546, pitWoman: 932, netMan: 4807.44, netWoman: 5441.94, diff: 634.50, genderTax: 0.1166, total5: 38070 }, // prettier-ignore
	{ gross: 15000, pitMan: 18626, pitWoman: 9776, netMan: 10967.44, netWoman: 11704.94, diff: 737.50, genderTax: 0.0630, total5: 44250 }, // prettier-ignore
	{ gross: 30000, pitMan: 39748, pitWoman: 30305, netMan: 23542.81, netWoman: 24329.72, diff: 786.92, genderTax: 0.0323, total5: 47215 } // prettier-ignore
];

function checkRow(contract: ContractType, row: Row, ryczaltRate?: number) {
	const r = calculatePit0({ grossSalary: row.gross, contract, ryczaltRate });
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

describe('calculatePit0 – tabela B2B ryczałt 12% (docs/PIT-0-PRZYKLAD.md)', () => {
	for (const row of B2B_RYCZALT_12) {
		it(`przychód ${row.gross} zł`, () => checkRow('b2b-ryczalt', row, 0.12));
	}
});

describe('calculatePit0 – B2B ryczałt: składki, stawka i ulga', () => {
	const b2b = (grossSalary: number, ryczaltRate?: number) =>
		calculatePit0({ grossSalary, contract: 'b2b-ryczalt', ryczaltRate });

	it('składki społeczne to stały „duży ZUS", niezależny od przychodu', () => {
		const expected = (SKL_EMERYT_B2B + SKL_RENT_B2B + SKL_WYPADK_B2B) * 12 * B2B_ZUS_BASE;
		expect(b2b(8000).socialContributions).toBeCloseTo(expected, 2);
		expect(b2b(30000).socialContributions).toBeCloseTo(expected, 2);
	});

	it('składka zdrowotna rośnie progami przychodu (60% / 100% / 180% podstawy)', () => {
		expect(b2b(4000).healthContribution).toBeCloseTo(SKL_ZDROWOTNA * 12 * 0.6 * B2B_ZDROW_BASE, 2); // 48k ≤ 60k
		expect(b2b(8000).healthContribution).toBeCloseTo(SKL_ZDROWOTNA * 12 * B2B_ZDROW_BASE, 2); // 96k
		expect(b2b(30000).healthContribution).toBeCloseTo(SKL_ZDROWOTNA * 12 * 1.8 * B2B_ZDROW_BASE, 2); // 360k > 300k
	});

	it('wyższa stawka ryczałtu → większa różnica płci', () => {
		expect(b2b(15000, 0.17).monthlyDifference).toBeGreaterThan(b2b(15000, 0.055).monthlyDifference);
	});

	it('brak stawki → stawka domyślna 12%', () => {
		expect(b2b(8000).pitMan).toBe(b2b(8000, DEFAULT_RYCZALT_RATE).pitMan);
	});

	it('różnica wynika wyłącznie z ryczałtu, bez ostrzeżenia przy typowym przychodzie', () => {
		const r = b2b(8000, 0.12);
		expect(r.monthlyDifference).toBeCloseTo((r.pitMan - r.pitWoman) / 12, 6);
		expect(r.warnings).toEqual([]);
	});
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
		expect(validatePit0({ grossSalary: 8000, contract: 'b2b-ryczalt', ryczaltRate: 0.12 })).toBe(
			true
		);
	});

	it('odrzuca pensję poza zakresem, nieznaną formę umowy i stawkę spoza zakresu', () => {
		expect(validatePit0({ grossSalary: 500, contract: 'uop' })).toBe(false);
		expect(validatePit0({ grossSalary: 8000, contract: 'x' as ContractType })).toBe(false);
		expect(validatePit0({ grossSalary: 8000, contract: 'b2b-ryczalt', ryczaltRate: 0.5 })).toBe(
			false
		);
	});

	it('przycina stawkę ryczałtu do zakresu, a jej brak sprowadza do domyślnej', () => {
		expect(clampPit0({ grossSalary: 8000, contract: 'b2b-ryczalt', ryczaltRate: 0.5 }).ryczaltRate).toBe(RYCZALT_RANGE.max); // prettier-ignore
		expect(clampPit0({ grossSalary: 8000, contract: 'b2b-ryczalt', ryczaltRate: 0.001 }).ryczaltRate).toBe(RYCZALT_RANGE.min); // prettier-ignore
		expect(clampPit0({ grossSalary: 8000, contract: 'b2b-ryczalt' }).ryczaltRate).toBe(
			DEFAULT_RYCZALT_RATE
		);
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
