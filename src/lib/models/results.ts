export type CalculatorWarning =
	/** S × 12 przekracza roczny limit wpłat na IKE – nadwyżka musi trafić poza IKE */
	| 'IKE_LIMIT_EXCEEDED'
	/** w > 55 – mniej niż 5 lat kalendarzowych wpłat do 60. urodzin (warunek zwolnienia podatkowego IKE) */
	| 'LESS_THAN_5_YEARS';

/**
 * Wynik kalkulacji. Wszystkie kwoty realne (w dzisiejszych złotówkach), netto.
 */
export interface CalculationResult {
	/** wiek w pełnych latach (floor z ageMonths / 12) */
	age: number;
	/** w_m – wiek w pełnych miesiącach; podstawa wszystkich wyliczeń */
	ageMonths: number;
	/** E – docelowa miesięczna emerytura */
	targetPension: number;
	/** K60 – kapitał wymagany w dniu 60. urodzin (wynik główny nr 1) */
	requiredCapital: number;
	/** n – liczba miesięcznych wpłat do 60. urodzin */
	monthsOfSaving: number;
	/** S – miesięczna wpłata na IKE (wynik główny nr 2) */
	monthlyContribution: number;
	/** S / P – udział wpłaty w pensji */
	salaryShare: number;
	/** S × n – suma wpłat z własnej kieszeni */
	totalContributions: number;
	/** S × 12 – do porównania z rocznym limitem IKE */
	annualContribution: number;
	warnings: CalculatorWarning[];
}

export interface ValidationError {
	field: keyof import('./inputs').CalculatorInputs;
	code: 'REQUIRED' | 'OUT_OF_RANGE';
}
