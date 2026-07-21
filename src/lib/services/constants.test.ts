import { describe, expect, it } from 'vitest';
import type { CalculatorInputs, YearMonth } from '$lib/models/inputs';
import { ageInMonths, clampInputs, defaultInputs } from './constants';

const NOW: YearMonth = { year: 2026, month: 6 };

function inputs(overrides: Partial<CalculatorInputs> = {}): CalculatorInputs {
	return { ...defaultInputs(NOW), ...overrides };
}

describe('clampInputs', () => {
	it('nie zmienia wartości w zakresie', () => {
		const valid = inputs({ birthYear: 1980, birthMonth: 3, netSalary: 12000 });
		expect(clampInputs(valid, NOW)).toEqual(valid);
	});

	it('przycina pensję i stopy do najbliższej granicy', () => {
		const clamped = clampInputs(
			inputs({ netSalary: -100, replacementRate: 1.5, returnAccum: 0.99, inflation: -0.02 }),
			NOW
		);
		expect(clamped.netSalary).toBe(1);
		expect(clamped.replacementRate).toBe(1);
		expect(clamped.returnAccum).toBe(0.15);
		expect(clamped.inflation).toBe(0);
	});

	it('wartości nieliczbowe wracają do domyślnych', () => {
		const clamped = clampInputs(inputs({ netSalary: NaN, returnPayout: Infinity }), NOW);
		expect(clamped.netSalary).toBe(8000);
		expect(clamped.returnPayout).toBe(0.035);
	});

	it('wiek powyżej górnej granicy → dokładnie 59 lat i 11 mies. (719 miesięcy)', () => {
		const clamped = clampInputs(inputs({ birthYear: 1950, birthMonth: 1 }), NOW);
		expect(ageInMonths(clamped, NOW)).toBe(719);
		expect(clamped).toMatchObject({ birthYear: 1966, birthMonth: 7 });
	});

	it('wiek poniżej 18 lat → dokładnie 18 (216 miesięcy)', () => {
		const clamped = clampInputs(inputs({ birthYear: 2020, birthMonth: 10 }), NOW);
		expect(ageInMonths(clamped, NOW)).toBe(216);
		expect(clamped).toMatchObject({ birthYear: 2008, birthMonth: 6 });
	});

	it('przycięcie wieku zachowuje granicę miesiąca przy przejściu przez rok', () => {
		const nowMarch: YearMonth = { year: 2026, month: 3 };
		const clamped = clampInputs(inputs({ birthYear: 1960, birthMonth: 1 }), nowMarch);
		expect(ageInMonths(clamped, nowMarch)).toBe(719);
		expect(clamped).toMatchObject({ birthYear: 1966, birthMonth: 4 });
	});

	it('miesiąc urodzenia poza 1–12 → przycięty', () => {
		expect(clampInputs(inputs({ birthMonth: 0 }), NOW).birthMonth).toBe(1);
		expect(clampInputs(inputs({ birthMonth: 13 }), NOW).birthMonth).toBe(12);
	});

	it('nieliczbowy rok urodzenia → domyślna data', () => {
		const clamped = clampInputs(inputs({ birthYear: NaN }), NOW);
		expect(clamped.birthYear).toBe(NOW.year - 30);
		expect(clamped.birthMonth).toBe(NOW.month);
	});
});
