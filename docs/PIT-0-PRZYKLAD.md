# Przykład liczbowy krok po kroku

Pełne przeliczenie przykładu z [PIT-0-ALGORYTM.md](PIT-0-ALGORYTM.md) § 9 — mężczyzna i kobieta
z identyczną pensją **8 000 zł brutto** na **umowie o pracę**, najczęstszy przypadek podatnika
(§ 3 algorytmu). Szczegółowo liczymy ten wariant, a na końcu tabele dla innych pensji oraz dla
umowy zlecenia.

Sedno: **składki ZUS i zdrowotna są identyczne dla obu płci** — jedyną różnicą jest podatek
dochodowy, którego kobieta (dzięki uldze PIT-0 dla seniora) w tym przypadku nie płaci wcale.

## Dane wejściowe i założenia

```
pensja_brutto = 8 000 zł / mies.
forma         = umowa o pracę
```

Stałe systemowe (2026), wspólne dla obu płci:

```
składka emerytalna = 9,76%
składka rentowa    = 1,50%
składka chorobowa  = 2,45%   (UoP obowiązkowa)   → razem społeczne s = 13,71%
składka zdrowotna  = 9,00%   (od podstawy po składkach społecznych)
KUP roczne (UoP)   = 3 000 zł   (12 × 250 zł)
limit ulgi PIT-0   = 85 528 zł  przychodu rocznie
próg skali         = 120 000 zł
stawki             = 12% / 32%
kwota zmniejszająca = 3 600 zł  (12% × 30 000 zł kwoty wolnej)
```

## Krok 0. Rocznienie

```
brutto_roczne = 12 × 8 000 zł = 96 000 zł
```

## Krok 1. Składki społeczne i zdrowotna (identyczne dla M i K)

```
składki_społeczne = 13,71% × 96 000 zł           = 13 161,60 zł
podstawa_zdrowotnej = 96 000 − 13 161,60          = 82 838,40 zł
składka_zdrowotna = 9% × 82 838,40                =  7 455,46 zł
```

Te 20 617,06 zł (składki + zdrowotna) płaci tak samo mężczyzna, jak i kobieta — ulga PIT-0
ich **nie** dotyczy.

## Krok 2. Funkcja pomocnicza: podatek wg skali

Podstawę i podatek zaokrąglamy do pełnych złotych (jak w zeznaniu rocznym):

```
PIT(dochód):
    p = round(dochód)
    t = 12% × min(p, 120 000) + 32% × max(0, p − 120 000) − 3 600
    return round(max(t, 0))
```

Kwota zmniejszająca 3 600 zł to właśnie **kwota wolna 30 000 zł** wbudowana w skalę.

## Krok 3. Podatek mężczyzny (bez ulgi)

```
KUP_M    = 3 000 zł
dochód_M = 96 000 − 13 161,60 − 3 000 = 79 838,40 zł   → podstawa 79 838 zł
PIT_M    = 12% × 79 838 − 3 600 = 9 580,56 − 3 600 = 5 980,56 zł   → 5 981 zł
```

## Krok 4. Podatek kobiety (z ulgą PIT-0 dla seniora)

Przychód dzielimy na część zwolnioną (do limitu 85 528 zł) i opodatkowaną. Składki społeczne
przypisujemy proporcjonalnie — odliczalna jest tylko część przypadająca na przychód
opodatkowany:

```
przychód_zwolniony  = min(96 000, 85 528)        = 85 528 zł
przychód_opodatkowany = 96 000 − 85 528           = 10 472 zł
udział_opodatkowany u = 10 472 / 96 000           = 0,109083

składki_odliczalne = 13 161,60 × 0,109083          =  1 435,71 zł
KUP_K              = min(3 000, 10 472)            =  3 000,00 zł
dochód_K           = 10 472 − 3 000 − 1 435,71     =  6 036,29 zł   → podstawa 6 036 zł
PIT_K              = max(12% × 6 036 − 3 600, 0)
                   = max(724,32 − 3 600, 0)        =      0 zł
```

Kluczowy moment: nadwyżka kobiety ponad limit (10 472 zł) po odjęciu kosztów i składek daje
podstawę **6 036 zł**, a 12% z niej (724 zł) jest **mniejsze niż kwota zmniejszająca 3 600 zł**
— czyli **kwota wolna w całości pokrywa podatek od nadwyżki**. Kobieta nie płaci PIT ani grosza.

## Krok 5. Wypłaty netto (miesięczne) — wyniki główne nr 1 i 2

```
netto_M = (96 000 − 13 161,60 − 7 455,46 − 5 981) / 12 = 69 401,94 / 12 = 5 783,50 zł / mies.
netto_K = (96 000 − 13 161,60 − 7 455,46 −     0) / 12 = 75 382,94 / 12 = 6 281,91 zł / mies.
```

## Krok 6. Miara nierówności — wyniki główne nr 3 i 4

```
różnica_miesięczna = 6 281,91 − 5 783,50 = 498,42 zł / mies.     ( = 5 981 / 12 )
podatek_od_płci    = 498,42 / 6 281,91   = 7,93%                 (netto M niższe o tyle % niż K)
suma_5_lat         = 498,42 × 60         = 29 905 zł             ( = 5 981 × 5 )
```

Czyli: przy 8 000 zł brutto mężczyzna przez 5 lat (60–65) oddaje fiskusowi **29 905 zł**,
których kobieta na identycznym stanowisku nie płaci — bo prawo pozwala jej skorzystać z ulgi
5 lat wcześniej.

## Inne pensje — umowa o pracę

Ta sama procedura dla różnych poziomów brutto. Kobieta zaczyna płacić realny PIT dopiero, gdy
podstawa z nadwyżki ponad limit przebije kwotę wolną (dopiero przy wysokich pensjach), więc do
ok. 10 000 zł brutto jej PIT wynosi 0.

| Brutto / mies. |      Netto M |      Netto K | Różnica / mies. | Podatek od płci | Suma za 5 lat |
| -------------: | -----------: | -----------: | --------------: | --------------: | ------------: |
|       4 000 zł |  3 056,79 zł |  3 140,96 zł |        84,17 zł |           2,68% |      5 050 zł |
|       6 000 zł |  4 420,18 zł |  4 711,43 zł |       291,25 zł |           6,18% |     17 475 zł |
|       8 000 zł |  5 783,50 zł |  6 281,91 zł |       498,42 zł |           7,93% |     29 905 zł |
|      10 000 zł |  7 146,89 zł |  7 852,39 zł |       705,50 zł |           8,98% |     42 330 zł |
|      15 000 zł | 10 016,67 zł | 11 293,42 zł |     1 276,75 zł |          11,31% |     76 605 zł |

Przy 10 000 zł kobieta wciąż ma PIT = 0 (nadwyżka 34 472 zł → podstawa 26 746 zł → 12% = 3 210 zł
< 3 600 zł kwoty wolnej). Dopiero przy 15 000 zł jej podatek staje się dodatni (5 822 zł rocznie),
ale i tak dużo niższy niż mężczyzny (21 143 zł) — stąd największa nominalna różnica.

## Inne pensje — umowa zlecenie

Zlecenie: bez dobrowolnej składki chorobowej (składki społeczne **11,26%**) i z kosztami
**20%** liczonymi od przychodu po składkach. Wyższe koszty i niższe składki dają wyższe netto,
ale też mniejszą bazę podatku — dlatego „podatek od płci" jest procentowo nieco niższy niż na UoP.

| Brutto / mies. |      Netto M |      Netto K | Różnica / mies. | Podatek od płci | Suma za 5 lat |
| -------------: | -----------: | -----------: | --------------: | --------------: | ------------: |
|       4 000 zł |  3 189,39 zł |  3 230,14 zł |        40,75 zł |           1,26% |      2 445 zł |
|       6 000 zł |  4 634,04 zł |  4 845,20 zł |       211,17 zł |           4,36% |     12 670 zł |
|       8 000 zł |  6 078,77 zł |  6 460,27 zł |       381,50 zł |           5,91% |     22 890 zł |
|      10 000 zł |  7 523,42 zł |  8 075,34 zł |       551,92 zł |           6,83% |     33 115 zł |
|      15 000 zł | 11 005,34 zł | 11 742,34 zł |       737,00 zł |           6,28% |     44 220 zł |

## Bardzo wysokie pensje — limit 30-krotności

Powyżej rocznego limitu **282 600 zł** (= 30-krotność prognozowanego wynagrodzenia; przy
umowie o pracę ok. **23 550 zł brutto / mies.**) składki **emerytalna i rentowa przestają być
pobierane**; chorobowa (UoP) i zdrowotna są bez limitu. Model liczy to wprost, więc wynik jest
dokładny także dla najwyższych pensji — bez osobnego ostrzeżenia.

Przykład dla **30 000 zł brutto / mies.** na umowie o pracę (`B_rok = 360 000 zł`):

```
podst. emeryt.+rent. = min(360 000, 282 600)              = 282 600 zł
składki_społeczne    = 11,26% × 282 600 + 2,45% × 360 000 =  40 640,76 zł
                       (bez limitu byłoby 13,71% × 360 000 =  49 356,00 zł)
```

| Brutto / mies. |      Netto M |      Netto K | Różnica / mies. | Podatek od płci | Suma za 5 lat |
| -------------: | -----------: | -----------: | --------------: | --------------: | ------------: |
|      30 000 zł | 18 081,83 zł | 20 105,08 zł |     2 023,25 zł |          10,06% |    121 395 zł |

---

Wartości powyżej są policzone dokładnie tymi samymi wzorami co w `src/lib/services/pit0.ts`;
testy (`src/lib/services/pit0.test.ts`) weryfikują tabele z tolerancją groszową.
