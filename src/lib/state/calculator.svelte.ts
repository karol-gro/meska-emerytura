import type { CalculatorInputs, YearMonth } from '$lib/models/inputs';
import { calculate } from '$lib/services/calculator';
import { decode, encode, QUERY_PARAM } from '$lib/services/codec';
import { clampInputs, defaultInputs } from '$lib/services/constants';

/**
 * Reaktywny stan kalkulatora: wejścia + wynik wyliczany na bieżąco.
 * Logika liczenia i kodowania żyje w serwisach — tutaj tylko spięcie z runes i URL-em.
 *
 * `inputs` może chwilowo być poza zakresem (użytkownik w trakcie pisania) — wynik
 * i URL zawsze liczymy z wersji przyciętej (`sanitized`), a `commit()` (na blur pola)
 * przycina też same pola formularza.
 */
export class CalculatorState {
	readonly now: YearMonth;
	inputs = $state() as CalculatorInputs;
	sanitized = $derived.by(() => clampInputs(this.inputs, this.now));
	result = $derived.by(() => calculate(this.sanitized, this.now));
	shareUrl = $derived.by(() => {
		const url = new URL(this.baseUrl);
		url.searchParams.set(QUERY_PARAM, encode(this.sanitized));
		return url.toString();
	});

	/** Czy aplikację otwarto z linka z wynikiem (poprawny `?s=`) — wtedy od razu pokazujemy wyniki */
	readonly startedFromLink: boolean;

	private baseUrl: string;

	constructor(now: YearMonth, url: URL) {
		this.now = now;
		this.baseUrl = url.origin + url.pathname;
		const encoded = url.searchParams.get(QUERY_PARAM);
		const fromLink = encoded ? decode(encoded, now) : null;
		this.startedFromLink = fromLink !== null;
		this.inputs = fromLink ?? defaultInputs(now);
	}

	/** Przycina pola formularza do zakresów — wywoływane na blur/change pól */
	commit(): void {
		this.inputs = this.sanitized;
	}

	/** Usuwa `?s=` z paska adresu po wejściu z udostępnionego linka — wywołać raz po starcie */
	stripShareParam(): void {
		if (this.startedFromLink) history.replaceState(history.state, '', this.baseUrl);
	}
}
