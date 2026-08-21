import { describe, expect, it } from 'vitest';
import type { CzasZyciaInputs } from '$lib/models/czas-zycia';
import {
	AGE,
	calculate,
	clamp,
	DEFAULT_INPUTS,
	growingAnnuitySum,
	monthlyRealRate,
	realAnnualRate,
	validate
} from './czas-zycia';

describe('realAnnualRate / monthlyRealRate (§7 krok 1, wzór Fishera – jak w IKE-ALGORYTM)', () => {
	it('wal_e 4,0%, i 2,5% → realnie ok. 1,4634% rocznie', () => {
		expect(realAnnualRate(0.04, 0.025)).toBeCloseTo(0.014634146341463428, 12);
	});

	it('miesięczna realna waloryzacja ≈ 0,1211%', () => {
		expect(monthlyRealRate(0.04, 0.025)).toBeCloseTo(0.0012114082097878232, 12);
	});

	it('zwraca 0, gdy waloryzacja równa inflacji', () => {
		expect(monthlyRealRate(0.025, 0.025)).toBeCloseTo(0, 12);
	});
});

describe('growingAnnuitySum (§7 krok 5, suma(e) – renta rosnąca)', () => {
	it('q = 0 → zwykła suma bez waloryzacji (wzór graniczny)', () => {
		expect(growingAnnuitySum(4500, 240, 0)).toBe(4500 * 240);
	});

	it('przykład domyślny: suma(e_M) = 240 mies. przy q_e ≈ 0,1211%/mies.', () => {
		const q = monthlyRealRate(0.04, 0.025);
		expect(growingAnnuitySum(4500, 240, q)).toBeCloseTo(1252513.01, 1);
	});

	it('przykład domyślny: suma(e_K) = 296,4 mies. przy q_e ≈ 0,1211%/mies.', () => {
		const q = monthlyRealRate(0.04, 0.025);
		expect(growingAnnuitySum(4500, 296.4, q)).toBeCloseTo(1603531.34, 1);
	});
});

describe('validate', () => {
	it('akceptuje wejścia domyślne', () => {
		expect(validate(DEFAULT_INPUTS)).toBe(true);
	});

	it('odrzuca prognozę poza zakresem', () => {
		expect(validate({ ...DEFAULT_INPUTS, monthlyPension: 500 })).toBe(false);
		expect(validate({ ...DEFAULT_INPUTS, monthlyPension: 25_000 })).toBe(false);
	});

	it('odrzuca nie-liczby', () => {
		expect(validate({ ...DEFAULT_INPUTS, monthlyPension: NaN })).toBe(false);
	});
});

describe('clamp', () => {
	it('przycina prognozę do zakresu 1 000 – 20 000 zł', () => {
		expect(clamp({ ...DEFAULT_INPUTS, monthlyPension: 500 }).monthlyPension).toBe(1_000);
		expect(clamp({ ...DEFAULT_INPUTS, monthlyPension: 25_000 }).monthlyPension).toBe(20_000);
	});

	it('nie-liczbę zamienia na wartość domyślną', () => {
		expect(clamp({ ...DEFAULT_INPUTS, monthlyPension: NaN }).monthlyPension).toBe(
			DEFAULT_INPUTS.monthlyPension
		);
	});

	it('gwarancja ustawowa: waloryzacja nie może być niższa od inflacji (§9)', () => {
		const clamped = clamp({ ...DEFAULT_INPUTS, pensionValorization: 0.01, inflation: 0.025 });
		expect(clamped.pensionValorization).toBe(0.025);
	});
});

describe('calculate – przykład domyślny (docs/CZAS-ZYCIA-PRZYKLAD.md: E=4500 zł, wiek 60)', () => {
	const result = calculate(DEFAULT_INPUTS);

	it('krok 0: tablice dla wieku 60', () => {
		expect(result.eUnisex).toBe(268.9);
		expect(result.eMale).toBe(240.0);
		expect(result.eFemale).toBe(296.4);
	});

	it('krok 2: kapitał K = 1 210 050 zł', () => {
		expect(result.capital).toBeCloseTo(1_210_050, 2);
	});

	it('krok 3: E_M = 5 041,88 zł – wynik główny nr 2', () => {
		expect(result.pensionIfMaleTable).toBeCloseTo(5_041.875, 3);
	});

	it('krok 4: d_M = 541,88 zł/mies., u_M_mies ≈ 10,75%', () => {
		expect(result.monthlyGap).toBeCloseTo(541.88, 2);
		expect(result.monthlyGapShare).toBeCloseTo(0.1075, 3);
	});

	it('krok 5: D_para ≈ 351 018 zł – wynik główny nr 1', () => {
		expect(result.lifetimeGap).toBeCloseTo(351_018, 0);
	});

	it('krok 6: m_M/m_K i wieki dożycia/zwrotu', () => {
		expect(result.monthsLeftInSystem).toBeCloseTo(28.9, 6);
		expect(result.extraMonthsWoman).toBeCloseTo(27.5, 6);
		expect(result.breakEvenAge).toBeCloseTo(82.408333, 5);
		expect(result.lifeExpectancyAgeMale).toBeCloseTo(80.0, 5);
		expect(result.lifeExpectancyAgeFemale).toBeCloseTo(84.7, 5);
	});

	it('ostrzeżenie MALE_AGE_HYPOTHETICAL – AGE (60) < WIEK_EMERYTALNY_M (65)', () => {
		expect(AGE).toBeLessThan(65);
		expect(result.warnings).toEqual(['MALE_AGE_HYPOTHETICAL']);
	});
});

describe('calculate – q_e = 0 wraca do płaskiej różnicy (§9)', () => {
	it('D_para = E × (e_K − e_M) bez waloryzacji', () => {
		const inputs: CzasZyciaInputs = { monthlyPension: 4_500, pensionValorization: 0, inflation: 0 };
		const result = calculate(inputs);
		expect(result.lifetimeGap).toBeCloseTo(4_500 * (296.4 - 240.0), 6);
	});
});

describe('calculate – liniowość w E (§6 D1)', () => {
	it('u_M_mies i miesiące nie zależą od prognozy', () => {
		const low = calculate({ ...DEFAULT_INPUTS, monthlyPension: 2_000 });
		const high = calculate({ ...DEFAULT_INPUTS, monthlyPension: 18_000 });
		expect(low.monthlyGapShare).toBeCloseTo(high.monthlyGapShare, 9);
		expect(low.monthsLeftInSystem).toBeCloseTo(high.monthsLeftInSystem, 9);
	});

	it('D_para skaluje się liniowo z prognozą', () => {
		const base = calculate({ ...DEFAULT_INPUTS, monthlyPension: 4_500 });
		const doubled = calculate({ ...DEFAULT_INPUTS, monthlyPension: 9_000 });
		expect(doubled.lifetimeGap).toBeCloseTo(base.lifetimeGap * 2, 6);
	});
});
