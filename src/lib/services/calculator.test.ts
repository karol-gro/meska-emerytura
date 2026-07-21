import { describe, expect, it } from 'vitest';
import type { CalculatorInputs, YearMonth } from '$lib/models/inputs';
import { DEFAULT_ASSUMPTIONS } from './constants';
import {
	annuityDuePresentValue,
	calculate,
	monthlyRealRate,
	sinkingFundPayment,
	validate
} from './calculator';

const NOW: YearMonth = { year: 2026, month: 6 };

/** Wejścia dla dokładnego wieku w pełnych latach (miesiąc urodzenia = bieżący) */
function inputsForAge(age: number, overrides: Partial<CalculatorInputs> = {}): CalculatorInputs {
	return {
		birthYear: NOW.year - age,
		birthMonth: NOW.month,
		netSalary: 8000,
		...DEFAULT_ASSUMPTIONS,
		...overrides
	};
}

describe('monthlyRealRate', () => {
	it('liczy realną miesięczną stopę wzorem Fishera', () => {
		// r=6%, i=2.5% → realna roczna ≈ 3.4146%, miesięczna ≈ 0.28024%
		const q = monthlyRealRate(0.06, 0.025);
		expect(q).toBeCloseTo(Math.pow(1.06 / 1.025, 1 / 12) - 1, 12);
	});

	it('zwraca 0, gdy stopa nominalna równa inflacji', () => {
		expect(monthlyRealRate(0.025, 0.025)).toBeCloseTo(0, 12);
	});

	it('zwraca ujemną stopę, gdy nominalna niższa od inflacji', () => {
		expect(monthlyRealRate(0.01, 0.025)).toBeLessThan(0);
	});
});

describe('wiek w pełnych miesiącach', () => {
	it('uwzględnia miesiąc urodzenia w liczbie wpłat', () => {
		// ur. wrzesień 1996, teraz czerwiec 2026 → 29 lat i 9 mies. = 357 mies. → n = 363
		const result = calculate(inputsForAge(30, { birthMonth: 9 }), NOW);
		expect(result.ageMonths).toBe(357);
		expect(result.age).toBe(29);
		expect(result.monthsOfSaving).toBe(720 - 357);
	});

	it('miesiąc urodzenia wcześniejszy niż bieżący zwiększa wiek', () => {
		// ur. styczeń 1996, teraz czerwiec 2026 → 30 lat i 5 mies. = 365 mies. → n = 355
		const result = calculate(inputsForAge(30, { birthMonth: 1 }), NOW);
		expect(result.ageMonths).toBe(365);
		expect(result.age).toBe(30);
		expect(result.monthsOfSaving).toBe(355);
	});

	it('miesiąc przed 60. urodzinami (górna granica) → n = 1', () => {
		const result = calculate(inputsForAge(60, { birthMonth: NOW.month + 1 }), NOW);
		expect(result.ageMonths).toBe(719);
		expect(result.monthsOfSaving).toBe(1);
	});
});

describe('przykład liczbowy z §10 (pensja 8000 zł, założenia domyślne)', () => {
	it('K60 ≈ 234 400 zł – mniej niż naiwne 60 × 4000', () => {
		const result = calculate(inputsForAge(30), NOW);
		expect(result.targetPension).toBe(4000);
		expect(result.requiredCapital).toBeCloseTo(234_400, -3); // tolerancja ±500
		expect(result.requiredCapital).toBeLessThan(240_000);
	});

	const table: { age: number; months: number; monthly: number; ikeExceeded: boolean }[] = [
		{ age: 25, months: 420, monthly: 293, ikeExceeded: false },
		{ age: 30, months: 360, monthly: 378, ikeExceeded: false },
		{ age: 40, months: 240, monthly: 686, ikeExceeded: false },
		{ age: 50, months: 120, monthly: 1646, ikeExceeded: false },
		{ age: 55, months: 60, monthly: 3592, ikeExceeded: true }
	];

	it.each(table)('wiek $age → S ≈ $monthly zł/mies.', ({ age, months, monthly, ikeExceeded }) => {
		const result = calculate(inputsForAge(age), NOW);
		expect(result.monthsOfSaving).toBe(months);
		// tolerancja 0.5% – wartości w specyfikacji są zaokrąglone
		expect(Math.abs(result.monthlyContribution - monthly)).toBeLessThan(monthly * 0.005);
		expect(result.warnings.includes('IKE_LIMIT_EXCEEDED')).toBe(ikeExceeded);
		expect(result.totalContributions).toBeCloseTo(result.monthlyContribution * months, 6);
		expect(result.annualContribution).toBeCloseTo(result.monthlyContribution * 12, 6);
		expect(result.salaryShare).toBeCloseTo(result.monthlyContribution / 8000, 12);
	});
});

describe('przypadki brzegowe (§8)', () => {
	it('zerowe stopy realne → wzory graniczne bez dzielenia przez zero', () => {
		const result = calculate(
			inputsForAge(30, { returnAccum: 0.025, returnPayout: 0.025, inflation: 0.025 }),
			NOW
		);
		expect(result.requiredCapital).toBeCloseTo(4000 * 60, 6);
		expect(result.monthlyContribution).toBeCloseTo((4000 * 60) / 360, 6);
	});

	it('realna stopa ujemna → wynik poprawnie rośnie względem stopy zerowej', () => {
		const negative = calculate(
			inputsForAge(30, { returnAccum: 0.01, returnPayout: 0.01, inflation: 0.025 }),
			NOW
		);
		expect(negative.requiredCapital).toBeGreaterThan(4000 * 60);
		expect(negative.monthlyContribution).toBeGreaterThan(negative.requiredCapital / 360);
	});

	it('mniej niż 60 miesięcy oszczędzania → ostrzeżenie o 5 latach wpłat', () => {
		// 55 lat i 1 miesiąc → n = 59
		const just = calculate(inputsForAge(55, { birthMonth: NOW.month - 1 }), NOW);
		expect(just.monthsOfSaving).toBe(59);
		expect(just.warnings).toContain('LESS_THAN_5_YEARS');
		// równo 55 lat → n = 60, bez ostrzeżenia
		expect(calculate(inputsForAge(55), NOW).warnings).not.toContain('LESS_THAN_5_YEARS');
	});
});

describe('funkcje pomocnicze', () => {
	it('annuityDuePresentValue przy q=0 zwraca amount × payments', () => {
		expect(annuityDuePresentValue(100, 60, 0)).toBe(6000);
	});

	it('sinkingFundPayment przy q=0 zwraca target / payments', () => {
		expect(sinkingFundPayment(6000, 60, 0)).toBe(100);
	});

	it('sinkingFundPayment odtwarza cel – spójność FV(S) = K', () => {
		const q = monthlyRealRate(0.06, 0.025);
		const s = sinkingFundPayment(100_000, 240, q);
		const futureValue = (s * (Math.pow(1 + q, 240) - 1)) / q;
		expect(futureValue).toBeCloseTo(100_000, 6);
	});
});

describe('validate', () => {
	it('akceptuje poprawne wejścia', () => {
		expect(validate(inputsForAge(30), NOW)).toEqual([]);
	});

	it('odrzuca wiek poza zakresem – z dokładnością do miesiąca', () => {
		// 17 lat i 11 mies. → za młody
		expect(validate(inputsForAge(18, { birthMonth: NOW.month + 1 }), NOW)).toContainEqual({
			field: 'birthYear',
			code: 'OUT_OF_RANGE'
		});
		// równo 18 lat → OK
		expect(validate(inputsForAge(18), NOW)).toEqual([]);
		// 59 lat i 11 mies. (miesiąc przed 60. urodzinami) → górna granica, OK
		expect(validate(inputsForAge(60, { birthMonth: NOW.month + 1 }), NOW)).toEqual([]);
		// równo 60 lat → poza zakresem (brak fazy oszczędzania został usunięty)
		expect(validate(inputsForAge(60), NOW)).toContainEqual({
			field: 'birthYear',
			code: 'OUT_OF_RANGE'
		});
		// 60 lat i 1 miesiąc → poza zakresem
		expect(validate(inputsForAge(60, { birthMonth: NOW.month - 1 }), NOW)).toContainEqual({
			field: 'birthYear',
			code: 'OUT_OF_RANGE'
		});
	});

	it('odrzuca miesiąc urodzenia poza 1–12', () => {
		expect(validate(inputsForAge(30, { birthMonth: 0 }), NOW)).toContainEqual({
			field: 'birthMonth',
			code: 'OUT_OF_RANGE'
		});
		expect(validate(inputsForAge(30, { birthMonth: 13 }), NOW)).toContainEqual({
			field: 'birthMonth',
			code: 'OUT_OF_RANGE'
		});
		expect(validate(inputsForAge(30, { birthMonth: 2.5 }), NOW)).toContainEqual({
			field: 'birthMonth',
			code: 'OUT_OF_RANGE'
		});
	});

	it('odrzuca pensję ≤ 0 i wartości niefinite', () => {
		expect(validate(inputsForAge(30, { netSalary: 0 }), NOW)).toContainEqual({
			field: 'netSalary',
			code: 'OUT_OF_RANGE'
		});
		expect(validate(inputsForAge(30, { inflation: NaN }), NOW)).toContainEqual({
			field: 'inflation',
			code: 'OUT_OF_RANGE'
		});
	});

	it('odrzuca stopy poza zakresem suwaków', () => {
		expect(validate(inputsForAge(30, { returnAccum: 0.2 }), NOW)).toContainEqual({
			field: 'returnAccum',
			code: 'OUT_OF_RANGE'
		});
		expect(validate(inputsForAge(30, { replacementRate: 0.1 }), NOW)).toContainEqual({
			field: 'replacementRate',
			code: 'OUT_OF_RANGE'
		});
	});
});
