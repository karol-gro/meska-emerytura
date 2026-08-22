import type { CzasZyciaInputs, CzasZyciaResult, CzasZyciaWarning } from '$lib/models/czas-zycia';
import { lifeTableRow } from './life-tables';
import type { Range } from './constants';

/** Stałe systemowe (docs/CZAS-ZYCIA-ALGORYTM.md §5) */
export const RETIREMENT_AGE_MALE = 65;

/** Zakres suwaka wieku (§2) – zgodny z zakresem przepisanych tablic w life-tables.ts */
export const AGE_RANGE: Range = { min: 60, max: 80 };
/** Domyślny wiek – ustawowy wiek emerytalny mężczyzny */
export const DEFAULT_AGE = RETIREMENT_AGE_MALE;

export const PENSION_RANGE: Range = { min: 1_000, max: 20_000 };
export const VALORIZATION_RANGE: Range = { min: 0, max: 0.15 };
export const INFLATION_RANGE: Range = { min: 0, max: 0.1 };

export const DEFAULT_INPUTS: CzasZyciaInputs = {
	monthlyPension: 4_500,
	age: DEFAULT_AGE,
	pensionValorization: 0.04,
	inflation: 0.025
};

/** Poniżej tej wartości traktujemy stopę jako zerową (wzór graniczny zamiast dzielenia przez ~0) */
const RATE_EPSILON = 1e-9;

/** Krok 1: nominalna roczna stopa → realna roczna (wzór Fishera, jak w IKE-ALGORYTM) */
export function realAnnualRate(nominalAnnual: number, inflation: number): number {
	return (1 + nominalAnnual) / (1 + inflation) - 1;
}

/** Krok 1: nominalna roczna stopa → realna miesięczna (Fisher + pierwiastek 12. stopnia) */
export function monthlyRealRate(nominalAnnual: number, inflation: number): number {
	return Math.pow(1 + realAnnualRate(nominalAnnual, inflation), 1 / 12) - 1;
}

/**
 * Krok 5: suma(e) – łączna wartość `months` comiesięcznych wypłat kwoty `amount`, rosnących
 * realnie o `q` miesięcznie (renta rosnąca, bez dyskontowania – §6 D4).
 */
export function growingAnnuitySum(amount: number, months: number, q: number): number {
	if (Math.abs(q) < RATE_EPSILON) return amount * months;
	return (amount * (Math.pow(1 + q, months) - 1)) / q;
}

export function validate(inputs: CzasZyciaInputs): boolean {
	return (
		Number.isFinite(inputs.monthlyPension) &&
		inputs.monthlyPension >= PENSION_RANGE.min &&
		inputs.monthlyPension <= PENSION_RANGE.max &&
		Number.isInteger(inputs.age) &&
		inputs.age >= AGE_RANGE.min &&
		inputs.age <= AGE_RANGE.max &&
		Number.isFinite(inputs.pensionValorization) &&
		inputs.pensionValorization >= VALORIZATION_RANGE.min &&
		inputs.pensionValorization <= VALORIZATION_RANGE.max &&
		Number.isFinite(inputs.inflation) &&
		inputs.inflation >= INFLATION_RANGE.min &&
		inputs.inflation <= INFLATION_RANGE.max
	);
}

/**
 * Przycina wejścia do zakresów (§9, tabela walidacji). Nie-liczby wracają do wartości
 * domyślnych; wiek jest zaokrąglany do pełnych lat; waloryzacja nie może być niższa od
 * inflacji (gwarancja ustawowa emerytur).
 */
export function clamp(inputs: CzasZyciaInputs): CzasZyciaInputs {
	const monthlyPension = Number.isFinite(inputs.monthlyPension)
		? Math.min(PENSION_RANGE.max, Math.max(PENSION_RANGE.min, inputs.monthlyPension))
		: DEFAULT_INPUTS.monthlyPension;
	const age = Number.isFinite(inputs.age)
		? Math.min(AGE_RANGE.max, Math.max(AGE_RANGE.min, Math.round(inputs.age)))
		: DEFAULT_INPUTS.age;
	const inflation = Number.isFinite(inputs.inflation)
		? Math.min(INFLATION_RANGE.max, Math.max(INFLATION_RANGE.min, inputs.inflation))
		: DEFAULT_INPUTS.inflation;
	const pensionValorizationRaw = Number.isFinite(inputs.pensionValorization)
		? Math.min(VALORIZATION_RANGE.max, Math.max(VALORIZATION_RANGE.min, inputs.pensionValorization))
		: DEFAULT_INPUTS.pensionValorization;
	// gwarancja ustawowa (§9): nominalna waloryzacja nie może być niższa od inflacji
	const pensionValorization = Math.max(pensionValorizationRaw, inflation);
	return { monthlyPension, age, pensionValorization, inflation };
}

/**
 * Algorytm z docs/CZAS-ZYCIA-ALGORYTM.md §7. Zakłada wejścia przycięte przez `clamp()`.
 */
export function calculate(inputs: CzasZyciaInputs): CzasZyciaResult {
	// Krok 0
	const { unisex: eUnisex, male: eMale, female: eFemale } = lifeTableRow(inputs.age);

	// Krok 1
	const q = monthlyRealRate(inputs.pensionValorization, inputs.inflation);

	// Krok 2
	const capital = inputs.monthlyPension * eUnisex;

	// Krok 3 – wynik główny nr 2
	const pensionIfMaleTable = capital / eMale;

	// Krok 4
	const monthlyGap = pensionIfMaleTable - inputs.monthlyPension;
	const monthlyGapShare = monthlyGap / pensionIfMaleTable;

	// Krok 5 – wynik główny nr 1
	const lifetimeGap =
		growingAnnuitySum(inputs.monthlyPension, eFemale, q) -
		growingAnnuitySum(inputs.monthlyPension, eMale, q);

	// Krok 6
	const monthsLeftInSystem = eUnisex - eMale;
	const extraMonthsWoman = eFemale - eUnisex;
	const lifeExpectancyAgeUnisex = inputs.age + eUnisex / 12;
	const lifeExpectancyAgeMale = inputs.age + eMale / 12;
	const lifeExpectancyAgeFemale = inputs.age + eFemale / 12;

	const warnings: CzasZyciaWarning[] = [];
	if (inputs.age < RETIREMENT_AGE_MALE) warnings.push('MALE_AGE_HYPOTHETICAL');

	return {
		eUnisex,
		eMale,
		eFemale,
		capital,
		pensionIfMaleTable,
		monthlyGap,
		monthlyGapShare,
		lifetimeGap,
		monthsLeftInSystem,
		extraMonthsWoman,
		lifeExpectancyAgeUnisex,
		lifeExpectancyAgeMale,
		lifeExpectancyAgeFemale,
		warnings
	};
}
