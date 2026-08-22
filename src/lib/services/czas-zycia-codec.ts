import type { CzasZyciaInputs } from '$lib/models/czas-zycia';
import { validate } from './czas-zycia';

/**
 * Kompaktowy, wersjonowany zapis wejść do query param (`?s=...`).
 * Format v1: `1_<E>_<w>_<walE%>_<i%>`, np. `1_4500_65_4_2.5`. Stopy zapisujemy w procentach
 * (czytelniejsze i krótsze niż ułamki), separator `_` nie koliduje z kropką dziesiętną.
 * `decode()` zwraca `null` przy każdym błędzie → aplikacja startuje z domyślnymi.
 */
const VERSION = '1';
const SEPARATOR = '_';
export const QUERY_PARAM = 's';

const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;

/** Ułamek → procent z maks. 4 miejscami po przecinku, bez artefaktów zmiennoprzecinkowych */
function toPercent(fraction: number): number {
	return Math.round(fraction * 1_000_000) / 10_000;
}

function fromPercent(percent: number): number {
	return percent / 100;
}

export function encode(inputs: CzasZyciaInputs): string {
	return [
		VERSION,
		inputs.monthlyPension,
		inputs.age,
		toPercent(inputs.pensionValorization),
		toPercent(inputs.inflation)
	].join(SEPARATOR);
}

export function decode(encoded: string): CzasZyciaInputs | null {
	const parts = encoded.split(SEPARATOR);
	if (parts.length !== 5) return null;
	if (parts[0] !== VERSION) return null;
	if (parts.slice(1).some((part) => !NUMBER_PATTERN.test(part))) return null;

	const inputs: CzasZyciaInputs = {
		monthlyPension: Number(parts[1]),
		age: Number(parts[2]),
		pensionValorization: fromPercent(Number(parts[3])),
		inflation: fromPercent(Number(parts[4]))
	};

	return validate(inputs) ? inputs : null;
}
