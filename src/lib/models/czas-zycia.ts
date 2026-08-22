/**
 * Wejścia kalkulatora czasu życia (docs/CZAS-ZYCIA-ALGORYTM.md §2, §3).
 */
export interface CzasZyciaInputs {
	/** E – prognozowana emerytura miesięczna (zł, brutto) */
	monthlyPension: number;
	/** w – wiek przejścia na emeryturę (pełne lata) */
	age: number;
	/** wal_e – nominalna roczna waloryzacja emerytur */
	pensionValorization: number;
	/** i – inflacja roczna */
	inflation: number;
}

export type CzasZyciaWarning =
	/** w < WIEK_EMERYTALNY_M – dla mężczyzny to wiek hipotetyczny (kolumna pokazuje sam efekt tablicy) */
	'MALE_AGE_HYPOTHETICAL';

/**
 * Wynik kalkulacji (docs/CZAS-ZYCIA-ALGORYTM.md §7).
 */
export interface CzasZyciaResult {
	/** e_U – wspólna (unisex) tablica, miesiące */
	eUnisex: number;
	/** e_M – tablica męska, miesiące */
	eMale: number;
	/** e_K – tablica kobieca, miesiące */
	eFemale: number;
	/** K – odtworzony kapitał */
	capital: number;
	/** E_M – emerytura, gdyby ZUS policzył tablicą męską (wynik główny nr 2) */
	pensionIfMaleTable: number;
	/** d_M – różnica miesięczna E_M − E */
	monthlyGap: number;
	/** u_M_mies – d_M / E_M */
	monthlyGapShare: number;
	/** D_para – o ile więcej łącznie dostanie kobieta niż mężczyzna (wynik główny nr 1) */
	lifetimeGap: number;
	/** m_M – ile miesięcznych emerytur „traci" mężczyzna względem wspólnej tablicy */
	monthsLeftInSystem: number;
	/** m_K – ile dodatkowych miesięcznych emerytur pobiera kobieta */
	extraMonthsWoman: number;
	/** w_dozycia_U – statystyczny wiek dożycia wg wspólnej (unisex) tablicy ZUS */
	lifeExpectancyAgeUnisex: number;
	/** w_dozycia_M – statystyczny wiek dożycia mężczyzny */
	lifeExpectancyAgeMale: number;
	/** w_dozycia_K – statystyczny wiek dożycia kobiety */
	lifeExpectancyAgeFemale: number;
	warnings: CzasZyciaWarning[];
}
