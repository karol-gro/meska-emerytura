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

/**
 * Wiek 60–80 (§2, `AGE_RANGE`). Źródła (§4):
 * - `unisex`: Komunikat Prezesa GUS z 25 marca 2026 r. (M.P. 2026 poz. 319), załącznik –
 *   wiersze „wiek lat i 0 miesięcy", wartości wprost w miesiącach (1 miejsce po przecinku).
 * - `male`/`female`: GUS, „Trwanie życia w 2025 r.", Tablica A (arkusze „Ogółem mężczyźni" /
 *   „Ogółem kobiety", kolumna e(x)), e_x w latach (2 miejsca po przecinku) × 12 = miesiące.
 * Oba źródła opisują umieralność za 2025 r. (jeden rocznik, §4 zasady doboru danych).
 */
export const LIFE_TABLE: Record<number, LifeTableRow> = {
	60: { unisex: 268.9, male: 240.48, female: 296.52 },
	61: { unisex: 259.4, male: 231.6, female: 286.08 },
	62: { unisex: 250, male: 222.84, female: 275.76 },
	63: { unisex: 240.7, male: 214.32, female: 265.56 },
	64: { unisex: 231.7, male: 206.04, female: 255.6 },
	65: { unisex: 222.7, male: 198, female: 245.64 },
	66: { unisex: 214.1, male: 190.08, female: 235.92 },
	67: { unisex: 205.4, male: 182.4, female: 226.2 },
	68: { unisex: 197, male: 174.96, female: 216.72 },
	69: { unisex: 188.8, male: 167.64, female: 207.24 },
	70: { unisex: 180.6, male: 160.32, female: 198 },
	71: { unisex: 172.6, male: 153.24, female: 188.88 },
	72: { unisex: 164.6, male: 146.28, female: 180 },
	73: { unisex: 156.8, male: 139.44, female: 171.12 },
	74: { unisex: 149.2, male: 132.72, female: 162.48 },
	75: { unisex: 141.7, male: 126.12, female: 153.96 },
	76: { unisex: 134.3, male: 119.64, female: 145.68 },
	77: { unisex: 127.1, male: 113.28, female: 137.64 },
	78: { unisex: 120, male: 107.04, female: 129.72 },
	79: { unisex: 113.2, male: 101.04, female: 122.04 },
	80: { unisex: 106.4, male: 95.16, female: 114.48 }
};

/** Wiersz tablicy dla danego wieku; rzuca, gdy dane nie są jeszcze przepisane. */
export function lifeTableRow(age: number): LifeTableRow {
	const row = LIFE_TABLE[age];
	if (!row) throw new Error(`Brak danych tablicy dalszego trwania życia dla wieku ${age}`);
	return row;
}
