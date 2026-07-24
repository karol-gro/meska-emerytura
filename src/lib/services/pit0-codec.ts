import type { ContractType, Pit0Inputs } from '$lib/models/pit0';
import { validatePit0 } from './pit0';

/**
 * Kompaktowy, wersjonowany zapis wejść PIT-0 do query param (`?s=...`).
 * Format v1: `1_<brutto>_<forma>`, np. `1_8000_uop`. `decode()` zwraca `null` przy każdym
 * błędzie (zła wersja/liczba pól/nie-liczba/poza zakresem) → aplikacja startuje z domyślnymi.
 * Zmiana formatu = nowa wersja prefiksu; stare linki muszą dalej działać.
 */
const VERSION = '1';
const SEPARATOR = '_';
export const QUERY_PARAM = 's';

const CONTRACTS: readonly ContractType[] = ['uop', 'zlec'];
const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;

export function encode(inputs: Pit0Inputs): string {
	return [VERSION, inputs.grossSalary, inputs.contract].join(SEPARATOR);
}

export function decode(encoded: string): Pit0Inputs | null {
	const parts = encoded.split(SEPARATOR);
	if (parts.length !== 3 || parts[0] !== VERSION) return null;
	if (!NUMBER_PATTERN.test(parts[1])) return null;
	if (!CONTRACTS.includes(parts[2] as ContractType)) return null;

	const inputs: Pit0Inputs = {
		grossSalary: Number(parts[1]),
		contract: parts[2] as ContractType
	};
	return validatePit0(inputs) ? inputs : null;
}
