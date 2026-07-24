import type { ContractType, Pit0Inputs } from '$lib/models/pit0';
import { DEFAULT_RYCZALT_RATE, validatePit0 } from './pit0';

/**
 * Kompaktowy, wersjonowany zapis wejść PIT-0 do query param (`?s=...`).
 * Format v1: `1_<brutto>_<forma>[_<stawka>]`, np. `1_8000_uop` albo `1_15000_b2b-ryczalt_0.12`.
 * Stawka ryczałtu to **opcjonalne 4. pole** – dopisywane tylko dla `b2b-ryczalt`, więc dawne
 * 3-polowe linki (uop/zlec) z produkcji pozostają w pełni zgodne. `decode()` zwraca `null` przy
 * każdym błędzie (zła wersja/liczba pól/nie-liczba/poza zakresem) → aplikacja startuje z domyślnymi.
 * Zmiana układu pól = nowa wersja prefiksu; stare linki muszą dalej działać.
 */
const VERSION = '1';
const SEPARATOR = '_';
export const QUERY_PARAM = 's';

const CONTRACTS: readonly ContractType[] = ['uop', 'zlec', 'b2b-ryczalt'];
const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;

export function encode(inputs: Pit0Inputs): string {
	const fields: (string | number)[] = [VERSION, inputs.grossSalary, inputs.contract];
	// stawkę zapisujemy tylko tam, gdzie ma znaczenie – dzięki temu uop/zlec zostają 3-polowe
	if (inputs.contract === 'b2b-ryczalt') {
		fields.push(inputs.ryczaltRate ?? DEFAULT_RYCZALT_RATE);
	}
	return fields.join(SEPARATOR);
}

export function decode(encoded: string): Pit0Inputs | null {
	const parts = encoded.split(SEPARATOR);
	if (parts.length < 3 || parts.length > 4) return null;
	if (parts[0] !== VERSION) return null;
	if (!NUMBER_PATTERN.test(parts[1])) return null;
	if (!CONTRACTS.includes(parts[2] as ContractType)) return null;

	const inputs: Pit0Inputs = {
		grossSalary: Number(parts[1]),
		contract: parts[2] as ContractType
	};
	if (parts.length === 4) {
		if (!NUMBER_PATTERN.test(parts[3])) return null;
		inputs.ryczaltRate = Number(parts[3]);
	}
	return validatePit0(inputs) ? inputs : null;
}
