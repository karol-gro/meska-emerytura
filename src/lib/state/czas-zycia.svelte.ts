import type { CzasZyciaInputs } from '$lib/models/czas-zycia';
import { calculate, clamp, DEFAULT_INPUTS } from '$lib/services/czas-zycia';
import { decode, encode, QUERY_PARAM } from '$lib/services/czas-zycia-codec';

/**
 * Reaktywny stan kalkulatora czasu życia – bliźniaczy do `CalculatorState`/`Pit0State`.
 * Logika liczenia i kodowania żyje w serwisach; tutaj tylko spięcie z runes i URL-em.
 * Wynik i link liczymy zawsze z wersji przyciętej (`sanitized`).
 */
export class CzasZyciaState {
	inputs = $state() as CzasZyciaInputs;
	sanitized = $derived.by(() => clamp(this.inputs));
	result = $derived.by(() => calculate(this.sanitized));
	shareUrl = $derived.by(() => {
		const url = new URL(this.baseUrl);
		url.searchParams.set(QUERY_PARAM, encode(this.sanitized));
		return url.toString();
	});

	/** Czy aplikację otwarto z linka z wynikiem (poprawny `?s=`) – wtedy od razu pokazujemy wyniki */
	readonly startedFromLink: boolean;

	private baseUrl: string;

	constructor(url: URL) {
		this.baseUrl = url.origin + url.pathname;
		const encoded = url.searchParams.get(QUERY_PARAM);
		const fromLink = encoded ? decode(encoded) : null;
		this.startedFromLink = fromLink !== null;
		this.inputs = fromLink ?? { ...DEFAULT_INPUTS };
	}

	/** Przycina pola formularza do zakresów – wywoływane na blur/change pól */
	commit(): void {
		this.inputs = this.sanitized;
	}

	/** Usuwa `?s=` z paska adresu po wejściu z udostępnionego linka – wywołać raz po starcie */
	stripShareParam(): void {
		if (this.startedFromLink) history.replaceState(history.state, '', this.baseUrl);
	}
}
