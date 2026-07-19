# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projekt

Kalkulator „Męska emerytura" — czysto frontendowa apka (SvelteKit + adapter-static, SPA) licząca, ile mężczyzna musi odkładać na IKE, żeby przejść na emeryturę w wieku 60 lat (jak kobieta) zamiast 65. Specyfikacja algorytmu, wzory finansowe, walidacje i przykład liczbowy do testów: **ALGORYTM-IKE.md** — to źródło prawdy dla logiki; zmiany w algorytmie zaczynaj od tego pliku.

Język: UI, komentarze i dokumenty po polsku; identyfikatory w kodzie po angielsku.

## Komendy

```sh
pnpm dev          # serwer deweloperski (port 5173)
pnpm test         # wszystkie testy jednostkowe (vitest --run)
pnpm test:unit -- --run src/lib/services/calculator.test.ts   # jeden plik testów
pnpm check        # svelte-check (typy)
pnpm lint         # prettier --check
pnpm format       # prettier --write
pnpm build        # statyczny build do build/
wrangler deploy   # deploy na Cloudflare Workers (same assety, bez workera)
```

Menedżer pakietów: **pnpm**. Komponenty shadcn-svelte dodaje się przez `pnpm dlx shadcn-svelte@latest add <nazwa> --yes`.

## Architektura

Zasada nadrzędna: **cała logika biznesowa żyje w `src/lib/services/` jako czysty TypeScript bez zależności od Svelte** i jest pokryta testami kolokowanymi (`*.test.ts` obok źródła). Komponenty Svelte tylko prezentują.

Przepływ danych:

1. **`src/lib/models/inputs.ts`** — `CalculatorInputs`: wszystkie parametry wejściowe w jednym modelu (stopy jako ułamki, 0.06 = 6%).
2. **`src/lib/services/constants.ts`** — stałe systemowe, wartości domyślne i zakresy pól; jedyne źródło prawdy dla walidacji, suwaków UI i codeca.
3. **`src/lib/services/calculator.ts`** — `calculate(inputs, currentYear)` implementuje algorytm z ALGORYTM-IKE.md §6; `currentYear` zawsze jako parametr (deterministyczne testy). Ostrzeżenia zwracane jako typowane kody (`CalculatorWarning`), tłumaczone na komunikaty dopiero w UI (`WarningsList.svelte`).
4. **`src/lib/services/codec.ts`** — dwukierunkowe kodowanie modelu do query param `?s=` (wersjonowany format `1_<rok>_<miesiąc>_<pensja>_<sz%>_<ra%>_<rw%>_<i%>`). Wynik jest udostępnialny linkiem. `decode()` zwraca `null` przy każdym błędzie → apka startuje z domyślnymi. Zmiana formatu = nowa wersja prefiksu, stare linki muszą dalej działać.
5. **`src/lib/state/calculator.svelte.ts`** — jedyna warstwa reaktywna: klasa `CalculatorState` (runes), `$derived` wynik i `shareUrl`, synchronizacja paska adresu przez `history.replaceState` z debounce.
6. **`src/routes/+page.svelte`** — składa komponenty z `src/lib/components/`; stan wędruje w dół jako prop.

SSR jest wyłączony (`ssr = false`, `prerender = true` w `src/routes/+layout.ts`) — build to czysty statyczny SPA, hostowany jako assety Cloudflare Workers (`wrangler.jsonc`). Nie dodawaj kodu serwerowego (`+page.server.ts`, endpointy) — złamie to model hostingu.

Vite binduje się na `0.0.0.0` (konfig `server.host`) — wymagane, żeby port forwarding z Dev Containera (WSL) nie wisiał; nie usuwaj.

## Testy

Testy kalkulatora weryfikują przykład liczbowy z ALGORYTM-IKE.md §10 (K60 ≈ 234 400 zł, tabela wieków) i przypadki brzegowe z §8. Przy zmianie algorytmu najpierw zaktualizuj specyfikację i wartości oczekiwane w testach. Testy codeca: round-trip + odporność na śmieciowe wejście.
