import type { CalculatorInputs, YearMonth } from '$lib/models/inputs';

/** Stałe systemowe (§4 specyfikacji) – konfiguracja aplikacji, nie do edycji przez użytkownika */
export const RETIREMENT_AGE_F = 60;
export const RETIREMENT_AGE_M = 65;
export const GAP_YEARS = RETIREMENT_AGE_M - RETIREMENT_AGE_F;
export const GAP_MONTHS = GAP_YEARS * 12;
/** Roczny limit wpłat na IKE – 3 × prognozowane przeciętne wynagrodzenie (wartość na 2026) */
export const IKE_ANNUAL_LIMIT = 28_260;
/** Minimalna liczba lat kalendarzowych wpłat dla zwolnienia podatkowego IKE */
export const MIN_IKE_CONTRIBUTION_YEARS = 5;

/** Zakres dopuszczalnych wartości pola (ułamki dla stóp, zł dla pensji, lata dla wieku) */
export interface Range {
	min: number;
	max: number;
}

/** Wiek użytkownika: 18 lat – 59 lat i 11 mies. `AGE_RANGE.max` (= 60) wyznacza granicę roku
 *  urodzenia; górny limit w miesiącach to miesiąc przed 60. urodzinami, więc faza oszczędzania
 *  ma zawsze co najmniej 1 miesiąc (nie ma przypadku „równo 60 lat / brak fazy oszczędzania"). */
export const AGE_RANGE: Range = { min: 18, max: RETIREMENT_AGE_F };
export const MIN_AGE_MONTHS = AGE_RANGE.min * 12;
export const MAX_AGE_MONTHS = AGE_RANGE.max * 12 - 1;

export const INPUT_RANGES: Record<
	Exclude<keyof CalculatorInputs, 'birthYear' | 'birthMonth'>,
	Range
> = {
	netSalary: { min: 1, max: 1_000_000 },
	replacementRate: { min: 0.2, max: 1.0 },
	returnAccum: { min: 0, max: 0.15 },
	returnPayout: { min: 0, max: 0.15 },
	inflation: { min: 0, max: 0.1 },
	// dolna granica waloryzacji śledzi dynamicznie inflację (clampInputs); statyczne min = 0
	contributionValorization: { min: 0, max: 0.15 },
	pensionValorization: { min: 0, max: 0.15 },
	lifeExpectancyReduction: { min: 0, max: 0.3 }
};

export const DEFAULT_ASSUMPTIONS = {
	replacementRate: 0.5,
	returnAccum: 0.06,
	returnPayout: 0.035,
	inflation: 0.025,
	contributionValorization: 0.045,
	pensionValorization: 0.04,
	lifeExpectancyReduction: 0.13
} as const satisfies Partial<CalculatorInputs>;

/** Wiek w pełnych miesiącach */
export function ageInMonths(
	inputs: Pick<CalculatorInputs, 'birthYear' | 'birthMonth'>,
	now: YearMonth
): number {
	return (now.year - inputs.birthYear) * 12 + (now.month - inputs.birthMonth);
}

/** Domyślny stan wejść przy pierwszym wejściu do aplikacji (bez linka) */
export function defaultInputs(now: YearMonth): CalculatorInputs {
	return {
		birthYear: now.year - 30,
		birthMonth: now.month,
		netSalary: 8000,
		...DEFAULT_ASSUMPTIONS
	};
}

/** Data urodzenia odpowiadająca dokładnie zadanemu wiekowi w miesiącach */
function birthDateForAgeMonths(ageMonths: number, now: YearMonth): YearMonth {
	// miesiące liczymy od zera, żeby modulo działało; potem wracamy do 1–12
	const totalMonths = now.year * 12 + (now.month - 1) - ageMonths;
	return { year: Math.floor(totalMonths / 12), month: (totalMonths % 12) + 1 };
}

/**
 * Przycina wejścia do najbliższych dopuszczalnych wartości – pola „poprawiają się same".
 * Wartości nieliczbowe (np. wyczyszczone pole) wracają do domyślnych.
 */
export function clampInputs(inputs: CalculatorInputs, now: YearMonth): CalculatorInputs {
	const defaults = defaultInputs(now);

	const clamped: CalculatorInputs = { ...inputs };
	for (const [field, range] of Object.entries(INPUT_RANGES) as [
		keyof typeof INPUT_RANGES,
		Range
	][]) {
		const value = inputs[field];
		clamped[field] = Number.isFinite(value)
			? Math.min(range.max, Math.max(range.min, value))
			: defaults[field];
	}

	// Gwarancja ustawowa (§8): żadna waloryzacja nie może być niższa od inflacji – podnosimy do niej,
	// żeby realna waloryzacja była nieujemna. Dynamiczna granica zależna od (przyciętej) inflacji.
	clamped.contributionValorization = Math.max(clamped.contributionValorization, clamped.inflation);
	clamped.pensionValorization = Math.max(clamped.pensionValorization, clamped.inflation);

	if (!Number.isInteger(inputs.birthYear) || !Number.isInteger(inputs.birthMonth)) {
		clamped.birthYear = defaults.birthYear;
		clamped.birthMonth = defaults.birthMonth;
	} else {
		clamped.birthMonth = Math.min(12, Math.max(1, inputs.birthMonth));
		const ageMonths = ageInMonths({ ...inputs, birthMonth: clamped.birthMonth }, now);
		const clampedAge = Math.min(MAX_AGE_MONTHS, Math.max(MIN_AGE_MONTHS, ageMonths));
		if (clampedAge !== ageMonths) {
			const birth = birthDateForAgeMonths(clampedAge, now);
			clamped.birthYear = birth.year;
			clamped.birthMonth = birth.month;
		}
	}

	return clamped;
}
