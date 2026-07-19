/** Punkt w czasie z dokładnością do miesiąca (month: 1–12) */
export interface YearMonth {
	year: number;
	month: number;
}

/**
 * Wszystkie parametry wejściowe kalkulatora w jednym modelu.
 * Stopy i udziały przechowujemy jako ułamki (0.06 = 6%).
 */
export interface CalculatorInputs {
	/** Rok urodzenia — razem z birthMonth daje wiek w pełnych miesiącach */
	birthYear: number;
	/** Miesiąc urodzenia, 1–12 */
	birthMonth: number;
	/** P — pensja miesięczna netto (zł, w dzisiejszych złotówkach) */
	netSalary: number;
	/** sz — stopa zastąpienia (docelowa emerytura jako ułamek pensji netto) */
	replacementRate: number;
	/** r_a — nominalna roczna stopa zwrotu w fazie oszczędzania */
	returnAccum: number;
	/** r_w — nominalna roczna stopa zwrotu w fazie wypłat (60–65) */
	returnPayout: number;
	/** i — roczna inflacja */
	inflation: number;
}
