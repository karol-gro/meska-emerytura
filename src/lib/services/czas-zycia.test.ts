import { describe, expect, it } from 'vitest';
import type { CzasZyciaInputs } from '$lib/models/czas-zycia';
import {
	AGE_RANGE,
	calculate,
	clamp,
	DEFAULT_INPUTS,
	growingAnnuitySum,
	monthlyRealRate,
	realAnnualRate,
	RETIREMENT_AGE_MALE,
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

	it('przykład domyślny: suma(e_M) = 198 mies. przy q_e ≈ 0,1211%/mies.', () => {
		const q = monthlyRealRate(0.04, 0.025);
		expect(growingAnnuitySum(4500, 198, q)).toBeCloseTo(1_006_253.18, 1);
	});

	it('przykład domyślny: suma(e_K) = 245,64 mies. przy q_e ≈ 0,1211%/mies.', () => {
		const q = monthlyRealRate(0.04, 0.025);
		expect(growingAnnuitySum(4500, 245.64, q)).toBeCloseTo(1_286_546.12, 1);
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

	it('odrzuca wiek poza zakresem 60–80 i wiek niecałkowity', () => {
		expect(validate({ ...DEFAULT_INPUTS, age: 59 })).toBe(false);
		expect(validate({ ...DEFAULT_INPUTS, age: 81 })).toBe(false);
		expect(validate({ ...DEFAULT_INPUTS, age: 65.5 })).toBe(false);
	});
});

describe('clamp', () => {
	it('przycina prognozę do zakresu 1 000 – 20 000 zł', () => {
		expect(clamp({ ...DEFAULT_INPUTS, monthlyPension: 500 }).monthlyPension).toBe(1_000);
		expect(clamp({ ...DEFAULT_INPUTS, monthlyPension: 25_000 }).monthlyPension).toBe(20_000);
	});

	it('przycina wiek do zakresu 60–80 i zaokrągla do pełnych lat', () => {
		expect(clamp({ ...DEFAULT_INPUTS, age: 55 }).age).toBe(AGE_RANGE.min);
		expect(clamp({ ...DEFAULT_INPUTS, age: 90 }).age).toBe(AGE_RANGE.max);
		expect(clamp({ ...DEFAULT_INPUTS, age: 67.6 }).age).toBe(68);
	});

	it('nie-liczbę zamienia na wartość domyślną', () => {
		expect(clamp({ ...DEFAULT_INPUTS, monthlyPension: NaN }).monthlyPension).toBe(
			DEFAULT_INPUTS.monthlyPension
		);
		expect(clamp({ ...DEFAULT_INPUTS, age: NaN }).age).toBe(DEFAULT_INPUTS.age);
	});

	it('gwarancja ustawowa: waloryzacja nie może być niższa od inflacji (§9)', () => {
		const clamped = clamp({ ...DEFAULT_INPUTS, pensionValorization: 0.01, inflation: 0.025 });
		expect(clamped.pensionValorization).toBe(0.025);
	});
});

describe('calculate – przykład domyślny (docs/CZAS-ZYCIA-PRZYKLAD.md: E=4500 zł, wiek 65)', () => {
	const result = calculate(DEFAULT_INPUTS);

	it('domyślny wiek to ustawowy wiek emerytalny mężczyzny', () => {
		expect(DEFAULT_INPUTS.age).toBe(RETIREMENT_AGE_MALE);
	});

	it('krok 0: tablice dla wieku 65', () => {
		expect(result.eUnisex).toBe(222.7);
		expect(result.eMale).toBe(198);
		expect(result.eFemale).toBe(245.64);
	});

	it('krok 2: kapitał K = 1 002 150 zł', () => {
		expect(result.capital).toBeCloseTo(1_002_150, 2);
	});

	it('krok 3: E_M ≈ 5 061,36 zł – wynik główny nr 2', () => {
		expect(result.pensionIfMaleTable).toBeCloseTo(5_061.363636, 5);
	});

	it('krok 4: d_M ≈ 561,36 zł/mies., u_M_mies ≈ 11,09%', () => {
		expect(result.monthlyGap).toBeCloseTo(561.363636, 5);
		expect(result.monthlyGapShare).toBeCloseTo(0.11091154, 6);
	});

	it('krok 5: D_para ≈ 280 293 zł – wynik główny nr 1', () => {
		expect(result.lifetimeGap).toBeCloseTo(280_293, 0);
	});

	it('krok 6: m_M/m_K i wieki dożycia/zwrotu', () => {
		expect(result.monthsLeftInSystem).toBeCloseTo(24.7, 6);
		expect(result.extraMonthsWoman).toBeCloseTo(22.94, 6);
		expect(result.breakEvenAge).toBeCloseTo(83.558333, 5);
		expect(result.lifeExpectancyAgeMale).toBeCloseTo(81.5, 5);
		expect(result.lifeExpectancyAgeFemale).toBeCloseTo(85.47, 5);
	});

	it('brak ostrzeżenia MALE_AGE_HYPOTHETICAL – wiek domyślny to realny wiek emerytalny', () => {
		expect(result.warnings).toEqual([]);
	});
});

describe('calculate – ostrzeżenie MALE_AGE_HYPOTHETICAL (§7, krok 6)', () => {
	it('pojawia się dla wieku poniżej 65 lat', () => {
		const result = calculate({ ...DEFAULT_INPUTS, age: 60 });
		expect(result.warnings).toEqual(['MALE_AGE_HYPOTHETICAL']);
	});

	it('nie pojawia się dla wieku 65 lat i starszego', () => {
		expect(calculate({ ...DEFAULT_INPUTS, age: 65 }).warnings).toEqual([]);
		expect(calculate({ ...DEFAULT_INPUTS, age: 80 }).warnings).toEqual([]);
	});
});

describe('calculate – q_e = 0 wraca do płaskiej różnicy (§9)', () => {
	it('D_para = E × (e_K − e_M) bez waloryzacji', () => {
		const inputs: CzasZyciaInputs = {
			monthlyPension: 4_500,
			age: 60,
			pensionValorization: 0,
			inflation: 0
		};
		const result = calculate(inputs);
		expect(result.lifetimeGap).toBeCloseTo(4_500 * (296.52 - 240.48), 6);
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

describe('calculate – wiek 60 (docs/CZAS-ZYCIA-PRZYKLAD.md, wariant historyczny)', () => {
	it('E_M ≈ 5 031,81 zł, D_para ≈ 348 904 zł', () => {
		const result = calculate({ ...DEFAULT_INPUTS, age: 60 });
		expect(result.pensionIfMaleTable).toBeCloseTo(5_031.81, 1);
		expect(result.lifetimeGap).toBeCloseTo(348_904, 0);
	});
});
