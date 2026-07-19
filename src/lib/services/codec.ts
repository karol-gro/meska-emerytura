import type { CalculatorInputs, YearMonth } from '$lib/models/inputs';
import { validate } from './calculator';

/**
 * Kompaktowy, wersjonowany zapis wejść do query param (`?s=...`).
 * Format v1: `1_<rokUr>_<miesiącUr>_<pensja>_<sz%>_<ra%>_<rw%>_<i%>`
 * np. `1_1996_6_8000_50_6_3.5_2.5`. Stopy zapisujemy w procentach (czytelniejsze
 * i krótsze niż ułamki), separator `_` nie koliduje z kropką dziesiętną.
 */
const VERSION = '1';
const SEPARATOR = '_';
export const QUERY_PARAM = 's';

/** Kolejność pól procentowych w zakodowanym stringu (po dacie urodzenia i pensji) */
const PERCENT_FIELDS = ['replacementRate', 'returnAccum', 'returnPayout', 'inflation'] as const;

const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;

/** Ułamek → procent z maks. 4 miejscami po przecinku, bez artefaktów zmiennoprzecinkowych */
function toPercent(fraction: number): number {
	return Math.round(fraction * 1_000_000) / 10_000;
}

function fromPercent(percent: number): number {
	return percent / 100;
}

export function encode(inputs: CalculatorInputs): string {
	return [
		VERSION,
		inputs.birthYear,
		inputs.birthMonth,
		inputs.netSalary,
		...PERCENT_FIELDS.map((field) => toPercent(inputs[field]))
	].join(SEPARATOR);
}

/**
 * Dekoduje string z query param. Zwraca `null` przy jakimkolwiek błędzie
 * (zła wersja, zła liczba pól, nie-liczby, wartości poza zakresem) —
 * aplikacja wtedy startuje z wartościami domyślnymi.
 */
export function decode(encoded: string, now: YearMonth): CalculatorInputs | null {
	const parts = encoded.split(SEPARATOR);
	if (parts.length !== 4 + PERCENT_FIELDS.length || parts[0] !== VERSION) return null;
	if (parts.slice(1).some((part) => !NUMBER_PATTERN.test(part))) return null;

	const [birthYear, birthMonth, netSalary, ...percents] = parts.slice(1).map(Number);

	const inputs: CalculatorInputs = {
		birthYear,
		birthMonth,
		netSalary,
		replacementRate: fromPercent(percents[0]),
		returnAccum: fromPercent(percents[1]),
		returnPayout: fromPercent(percents[2]),
		inflation: fromPercent(percents[3])
	};

	return validate(inputs, now).length === 0 ? inputs : null;
}
