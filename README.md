# Męska emerytura

Kalkulator pokazujący koszt nierównego wieku emerytalnego w Polsce (kobiety 60 lat, mężczyźni 65). Liczy, **ile mężczyzna musi mieć na IKE w dniu 60. urodzin** i **ile musi w tym celu odkładać co miesiąc**, żeby sfinansować 5-letnią lukę, zanim ZUS zacznie płacić. Kobieta w identycznej sytuacji: 0 zł.

Pełna specyfikacja algorytmu (wzory, decyzje projektowe, walidacje, przykład liczbowy): [ALGORYTM-IKE.md](ALGORYTM-IKE.md).

## Funkcje

- Model realny: wszystkie kwoty w dzisiejszych złotówkach, netto (wypłata z IKE po 60. r.ż. bez podatku Belki)
- Edytowalne założenia: stopa zastąpienia, stopy zwrotu w obu fazach, inflacja
- Ostrzeżenia: przekroczony roczny limit wpłat IKE, mniej niż 5 lat wpłat do 60. urodzin
- Wynik udostępnialny linkiem — stan zakodowany w query param `?s=…`

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5, runes) + `adapter-static` — czysty statyczny SPA, bez backendu
- Tailwind CSS v4 + [shadcn-svelte](https://shadcn-svelte.com)
- Vitest — logika biznesowa w `src/lib/services/` to czysty TS z testami kolokowanymi
- Hosting: Cloudflare Workers (statyczne assety, bez workera)

## Development

Wymagania: Node 24+, pnpm. Repo zawiera konfigurację [Dev Containera](.devcontainer/devcontainer.json) z kompletem narzędzi (Node, pnpm, wrangler).

```sh
pnpm install
pnpm dev          # http://localhost:5173
```

Pozostałe komendy:

```sh
pnpm test         # testy jednostkowe
pnpm check        # kontrola typów (svelte-check)
pnpm lint         # kontrola formatowania
pnpm format       # formatowanie (prettier)
pnpm build        # build produkcyjny do build/
pnpm preview      # podgląd builda (http://localhost:4173)
```

## Deploy

Build to czyste statyczne assety serwowane przez Cloudflare Workers (konfiguracja w [wrangler.jsonc](wrangler.jsonc)):

```sh
pnpm build
wrangler deploy
```

## Struktura

```
src/lib/models/      – CalculatorInputs (jeden model wejść), typy wyników
src/lib/services/    – logika biznesowa (czysty TS + testy): kalkulator, codec URL, stałe
src/lib/state/       – reaktywny stan (runes) + synchronizacja query param
src/lib/components/  – komponenty UI (w tym ui/ generowane przez shadcn-svelte)
src/routes/          – strona główna (SPA, prerender, bez SSR)
```
