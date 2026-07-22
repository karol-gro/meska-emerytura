import type { CalculatorInputs, YearMonth } from '$lib/models/inputs';
import type { CalculationResult, CalculatorWarning, ValidationError } from '$lib/models/results';
import {
	ageInMonths,
	GAP_MONTHS,
	GAP_YEARS,
	IKE_ANNUAL_LIMIT,
	INPUT_RANGES,
	MAX_AGE_MONTHS,
	MIN_AGE_MONTHS,
	MIN_IKE_CONTRIBUTION_YEARS,
	RETIREMENT_AGE_F
} from './constants';

/** Poniżej tej wartości traktujemy stopę jako zerową (wzory graniczne zamiast dzielenia przez ~0) */
const RATE_EPSILON = 1e-9;

/** Krok 0: nominalna roczna stopa → realna roczna (wzór Fishera) */
export function realAnnualRate(nominalAnnual: number, inflation: number): number {
	return (1 + nominalAnnual) / (1 + inflation) - 1;
}

/** Krok 0: nominalna roczna stopa → realna miesięczna (Fisher + pierwiastek 12. stopnia) */
export function monthlyRealRate(nominalAnnual: number, inflation: number): number {
	return Math.pow(1 + realAnnualRate(nominalAnnual, inflation), 1 / 12) - 1;
}

/**
 * Krok 1c: średnia z `years` rocznych poziomów świadczenia startowego `start`, rosnących
 * co rok o realną stopę `rate` (waloryzacja emerytur). `rate = 0` → wszystkie poziomy równe `start`.
 */
export function averagedBenefit(start: number, rate: number, years: number): number {
	if (Math.abs(rate) < RATE_EPSILON) return start;
	const sumOfFactors = (Math.pow(1 + rate, years) - 1) / rate; // Σ dla k = 0..years-1
	return (start * sumOfFactors) / years;
}

/**
 * Krok 2: wartość obecna renty – `payments` comiesięcznych wypłat kwoty `amount`,
 * płatnych z góry, przy miesięcznej stopie `q`.
 */
export function annuityDuePresentValue(amount: number, payments: number, q: number): number {
	if (Math.abs(q) < RATE_EPSILON) return amount * payments;
	return amount * ((1 - Math.pow(1 + q, -payments)) / q) * (1 + q);
}

/**
 * Krok 4: miesięczna wpłata (na koniec miesiąca), której przyszła wartość po `payments`
 * miesiącach na stopie `q` równa się `target`.
 */
export function sinkingFundPayment(target: number, payments: number, q: number): number {
	if (Math.abs(q) < RATE_EPSILON) return target / payments;
	return (target * q) / (Math.pow(1 + q, payments) - 1);
}

export function validate(inputs: CalculatorInputs, now: YearMonth): ValidationError[] {
	const errors: ValidationError[] = [];
	if (!Number.isInteger(inputs.birthMonth) || inputs.birthMonth < 1 || inputs.birthMonth > 12) {
		errors.push({ field: 'birthMonth', code: 'OUT_OF_RANGE' });
	} else {
		const ageMonths = ageInMonths(inputs, now);
		if (
			!Number.isInteger(inputs.birthYear) ||
			ageMonths < MIN_AGE_MONTHS ||
			ageMonths > MAX_AGE_MONTHS
		) {
			errors.push({ field: 'birthYear', code: 'OUT_OF_RANGE' });
		}
	}
	for (const [field, range] of Object.entries(INPUT_RANGES) as [
		keyof typeof INPUT_RANGES,
		{ min: number; max: number }
	][]) {
		const value = inputs[field];
		if (!Number.isFinite(value) || value < range.min || value > range.max) {
			errors.push({ field, code: 'OUT_OF_RANGE' });
		}
	}
	return errors;
}

/**
 * Algorytm z docs/IKE-ALGORYTM.md §6. Zakłada wejścia zwalidowane przez `validate()`.
 * `now` jako parametr – deterministyczne testy i spójny wiek w całej aplikacji.
 */
export function calculate(inputs: CalculatorInputs, now: YearMonth): CalculationResult {
	const ageMonths = ageInMonths(inputs, now);
	const age = Math.floor(ageMonths / 12);
	const qAccum = monthlyRealRate(inputs.returnAccum, inputs.inflation);
	const qPayout = monthlyRealRate(inputs.returnPayout, inputs.inflation);

	// Krok 1: docelowa emerytura mężczyzny (w wieku 65)
	const targetPension = inputs.replacementRate * inputs.netSalary;
	// Krok 1a: emerytura kobiety w wieku 60 – bez 5 lat waloryzacji składek i z dłuższym dożyciem
	const contributionValReal = realAnnualRate(inputs.contributionValorization, inputs.inflation);
	const womanStartPension =
		(targetPension / Math.pow(1 + contributionValReal, GAP_YEARS)) *
		(1 - inputs.lifeExpectancyReduction);
	// Krok 1b–1c: świadczenie kobiety waloryzowane przez 5 lat, uśrednione – to odtwarza mężczyzna
	const pensionValReal = realAnnualRate(inputs.pensionValorization, inputs.inflation);
	const replacementBenefit = averagedBenefit(womanStartPension, pensionValReal, GAP_YEARS);
	// Krok 2: kapitał wymagany w dniu 60. urodzin (renta wypłacająca E_avg)
	const requiredCapital = annuityDuePresentValue(replacementBenefit, GAP_MONTHS, qPayout);
	// Krok 3: długość fazy oszczędzania w pełnych miesiącach (wiek ≤ 59 lat 11 mies. ⇒ n ≥ 1)
	const monthsOfSaving = RETIREMENT_AGE_F * 12 - ageMonths;

	const warnings: CalculatorWarning[] = [];

	// Krok 4: miesięczna wpłata
	const monthlyContribution = sinkingFundPayment(requiredCapital, monthsOfSaving, qAccum);
	// Krok 5: wyniki pochodne
	const annualContribution = monthlyContribution * 12;

	if (annualContribution > IKE_ANNUAL_LIMIT) warnings.push('IKE_LIMIT_EXCEEDED');
	if (monthsOfSaving < MIN_IKE_CONTRIBUTION_YEARS * 12) warnings.push('LESS_THAN_5_YEARS');

	return {
		age,
		ageMonths,
		targetPension,
		replacementBenefit,
		requiredCapital,
		monthsOfSaving,
		monthlyContribution,
		salaryShare: monthlyContribution / inputs.netSalary,
		totalContributions: monthlyContribution * monthsOfSaving,
		annualContribution,
		warnings
	};
}
