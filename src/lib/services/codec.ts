import type { CalculatorInputs, YearMonth } from '$lib/models/inputs';
import { validate } from './calculator';
import { DEFAULT_ASSUMPTIONS } from './constants';

/**
 * Kompaktowy, wersjonowany zapis wejść do query param (`?s=...`).
 * Format v2: `2_<rokUr>_<miesiącUr>_<pensja>_<sz%>_<ra%>_<rw%>_<i%>_<walS%>_<walE%>_<skr%>`
 * np. `2_1996_6_8000_50_6_3.5_2.5_4.5_4_13`. Stopy zapisujemy w procentach (czytelniejsze
 * i krótsze niż ułamki), separator `_` nie koliduje z kropką dziesiętną.
 *
 * Format v1 (`1_...` bez trzech ostatnich pól) dekodujemy nadal – brakujące założenia
 * uzupełniamy domyślnymi, żeby stare linki działały.
 */
const VERSION = '2';
const SEPARATOR = '_';
export const QUERY_PARAM = 's';

/** Kolejność pól procentowych w zakodowanym stringu (po dacie urodzenia i pensji) */
const PERCENT_FIELDS = [
	'replacementRate',
	'returnAccum',
	'returnPayout',
	'inflation',
	'contributionValorization',
	'pensionValorization',
	'lifeExpectancyReduction'
] as const;

/** Pola procentowe formatu v1 (bez trzech nowych założeń) – dla wstecznej zgodności linków */
const PERCENT_FIELDS_V1 = ['replacementRate', 'returnAccum', 'returnPayout', 'inflation'] as const;

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
 * (zła wersja, zła liczba pól, nie-liczby, wartości poza zakresem) –
 * aplikacja wtedy startuje z wartościami domyślnymi.
 */
export function decode(encoded: string, now: YearMonth): CalculatorInputs | null {
	const parts = encoded.split(SEPARATOR);
	const version = parts[0];
	const fields = version === VERSION ? PERCENT_FIELDS : version === '1' ? PERCENT_FIELDS_V1 : null;
	if (fields === null || parts.length !== 4 + fields.length) return null;
	if (parts.slice(1).some((part) => !NUMBER_PATTERN.test(part))) return null;

	const [birthYear, birthMonth, netSalary, ...percents] = parts.slice(1).map(Number);

	// Domyślne założenia jako baza – w v1 uzupełniają trzy pola nieobecne w linku.
	const inputs: CalculatorInputs = {
		birthYear,
		birthMonth,
		netSalary,
		...DEFAULT_ASSUMPTIONS
	};
	fields.forEach((field, index) => {
		inputs[field] = fromPercent(percents[index]);
	});

	return validate(inputs, now).length === 0 ? inputs : null;
}
