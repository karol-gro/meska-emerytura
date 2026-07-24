import type { Pit0Inputs } from '$lib/models/pit0';
import { calculatePit0, clampPit0, DEFAULT_PIT0_INPUTS } from '$lib/services/pit0';
import { decode, encode, QUERY_PARAM } from '$lib/services/pit0-codec';

/**
 * Reaktywny stan kalkulatora PIT-0 – bliźniaczy do `CalculatorState`.
 * Logika liczenia i kodowania żyje w serwisach; tutaj tylko spięcie z runes i URL-em.
 * Wynik i link liczymy zawsze z wersji przyciętej (`sanitized`).
 */
export class Pit0State {
	inputs = $state() as Pit0Inputs;
	sanitized = $derived.by(() => clampPit0(this.inputs));
	result = $derived.by(() => calculatePit0(this.sanitized));
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
		this.inputs = fromLink ?? { ...DEFAULT_PIT0_INPUTS };
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
