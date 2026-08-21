/**
 * Tablice dalszego trwania życia (docs/CZAS-ZYCIA-ALGORYTM.md §4), w miesiącach,
 * wg wieku w pełnych latach.
 */
export interface LifeTableRow {
	/** e_U – wspólna (unisex) tablica */
	unisex: number;
	/** e_M – tablica męska */
	male: number;
	/** e_K – tablica kobieca */
	female: number;
}

// TODO(§11 pkt 1): przepisać wiek 61–75 z komunikatu Prezesa GUS (M.P. 2026 poz. 319) i
// publikacji „Trwanie życia w 2025 r." Na razie tylko wiek 60 – jedyny rocznik z kompletem
// potwierdzonych wartości (§4); do tego czasu kalkulator obsługuje wyłącznie ten wiek.
export const LIFE_TABLE: Record<number, LifeTableRow> = {
	60: { unisex: 268.9, male: 240.0, female: 296.4 }
};

/** Wiersz tablicy dla danego wieku; rzuca, gdy dane nie są jeszcze przepisane. */
export function lifeTableRow(age: number): LifeTableRow {
	const row = LIFE_TABLE[age];
	if (!row) throw new Error(`Brak danych tablicy dalszego trwania życia dla wieku ${age}`);
	return row;
}
