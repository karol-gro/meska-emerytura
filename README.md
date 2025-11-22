# Męska Emerytura

Aplikacja frontend zbudowana z użyciem:
- **Svelte** - reaktywny framework UI
- **TypeScript** - typowanie statyczne
- **Tailwind CSS** - stylowanie utility-first
- **Vitest** - testy jednostkowe
- **Vite** - szybki bundler i dev server

## Uruchomienie projektu

### Instalacja zależności
```bash
npm install
```

### Uruchomienie serwera deweloperskiego
```bash
npm run dev
```

### Budowanie produkcyjne
```bash
npm run build
```

### Podgląd buildu produkcyjnego
```bash
npm run preview
```

### Uruchomienie testów
```bash
npm run test
```

### Uruchomienie testów z UI
```bash
npm run test:ui
```

### Sprawdzenie typów
```bash
npm run check
```

## Deployment na Cloudflare Workers

### Pierwsze wdrożenie
1. Zaloguj się do Cloudflare:
```bash
npx wrangler login
```

2. Wdróż aplikację:
```bash
npm run deploy
```

### Lokalne testowanie z Cloudflare Workers
```bash
npm run cf:dev
```

### Kolejne wdrożenia
Po pierwszym wdrożeniu, wystarczy uruchomić:
```bash
npm run deploy
```
