/** Forma umowy – wpływa na składki, koszty i sposób opodatkowania */
export type ContractType = 'uop' | 'zlec' | 'b2b-ryczalt';

/**
 * Wejścia kalkulatora PIT-0 (docs/PIT-0-ALGORYTM.md §2).
 * Ta sama pensja brutto dla mężczyzny i kobiety – porównujemy identyczną pracę.
 */
export interface Pit0Inputs {
	/** B – pensja/przychód miesięczny brutto (zł) */
	grossSalary: number;
	/** forma umowy: umowa o pracę / umowa zlecenie / działalność na ryczałcie */
	contract: ContractType;
	/**
	 * Stawka ryczałtu (ułamek, 0.12 = 12%) – używana tylko dla `b2b-ryczalt`.
	 * Pominięta dla pozostałych form; brak wartości = domyślna stawka (§4).
	 */
	ryczaltRate?: number;
}

export type Pit0Warning =
	/** PIT_M = 0 – przy tej pensji kwota wolna zeruje podatek obu płci, ulga nic nie zmienia */
	'NO_DIFFERENCE';

/**
 * Wynik kalkulacji PIT-0 (docs/PIT-0-ALGORYTM.md §6).
 * Kwoty roczne są bazą pośrednią; wyniki prezentacyjne to netto miesięczne i miary nierówności.
 */
export interface Pit0Result {
	/** B_rok – pensja brutto w skali roku */
	grossAnnual: number;
	/** składki społeczne (roczne) – identyczne dla obu płci */
	socialContributions: number;
	/** składka zdrowotna (roczna) – identyczna dla obu płci */
	healthContribution: number;
	/** PIT_M – roczny podatek mężczyzny (bez ulgi) */
	pitMan: number;
	/** PIT_K – roczny podatek kobiety (z ulgą PIT-0) */
	pitWoman: number;
	/** netto miesięczne mężczyzny */
	netMan: number;
	/** netto miesięczne kobiety */
	netWoman: number;
	/** netto_K − netto_M – o ile niższą wypłatę dostaje mężczyzna */
	monthlyDifference: number;
	/** „podatek od płci" – różnica jako ułamek netto kobiety */
	genderTax: number;
	/** łączna różnica w wypłatach przez 5 lat (60–65) */
	total5Years: number;
	warnings: Pit0Warning[];
}
