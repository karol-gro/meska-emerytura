# Przykład liczbowy krok po kroku

Pełne przeliczenie przykładu z [CZAS-ZYCIA-ALGORYTM.md](CZAS-ZYCIA-ALGORYTM.md) § 10 —
mężczyzna z prognozowaną emeryturą **4 500 zł brutto** i założeniami domyślnymi
(`wal_e` 4,0%, `i` 2,5%). Szczegółowo liczymy wariant **domyślnego wieku (65 lat)**,
a na końcu wariant **60 lat** (jedyny wiek, dla którego `w` jest jednocześnie realnym,
ustawowym wiekiem emerytalnym — ale dla kobiety, nie mężczyzny) oraz tabela dla
pozostałych wieków.

## Dane wejściowe i założenia

```
prognoza_E = 4 500 zł / mies.
wiek_w     = 65 lat
wal_e      = 4,0%   (nominalna roczna waloryzacja emerytur)
i          = 2,5%   (inflacja roczna)
```

## Krok 0. Tablice dla wieku 65

```
e_U = 222,7 mies.        e_M = 198,00 mies.        e_K = 245,64 mies.
```

Niezmiennik `e_M < e_U < e_K` spełniony: 198,00 < 222,7 < 245,64.

## Krok 1. Realna waloryzacja emerytur

```
wal_e_real = 1,04 / 1,025 − 1 = 0,0146341463          ≈ 1,4634% rocznie
q_e        = 1,0146341463^(1/12) − 1 = 0,0012114082    ≈ 0,1211% miesięcznie
```

## Krok 2. Odtworzenie kapitału

```
K = 4 500 zł × 222,7 = 1 002 150 zł
```

## Krok 3. Emerytura wg tablicy męskiej — wynik główny nr 2

```
E_M = 1 002 150 zł / 198,00 = 5 061,363... zł        → 5 061,36 zł
```

## Krok 4. Różnica miesięczna

```
d_M      = 5 061,36 − 4 500 = 561,36 zł / mies.
u_M_mies = 561,36 / 5 061,36 = 0,110912           ≈ 11,09%
```

Kontrola drugim wzorem: `1 − e_M / e_U = 1 − 198,00 / 222,7 = 0,110912 ≈ 11,09%`.

## Krok 5. Transfer za cały okres emerytury — wynik główny nr 1

Renta rosnąca `suma(e) = E × [(1 + q_e)^e − 1] / q_e`:

```
suma(e_M) = 4 500 zł × [(1,0012114082)^198   − 1] / 0,0012114082 = 1 006 253,18 zł
suma(e_K) = 4 500 zł × [(1,0012114082)^245,64 − 1] / 0,0012114082 = 1 286 546,12 zł

D_para = 1 286 546,12 − 1 006 253,18 = 280 292,94 zł    → 280 293 zł
```

Kontrola (nominalnie, bez waloryzacji — `q_e = 0`): `4 500 × (245,64 − 198,00) = 214 380 zł`.
Realna waloryzacja podnosi różnicę o ~31%, bo dodatkowe miesiące kobiety (`e_K − e_M`)
przypadają na później, gdy świadczenie jest już wyżej zwaloryzowane.

## Krok 6. Wyniki pochodne

```
m_M = 222,7 − 198,00 = 24,70 miesięcznych emerytur
m_K = 245,64 − 222,7 = 22,94 miesięcznych emerytur

w_dozycia_U = 65 + 222,7/12  = 83,6 lat     # tak długo dzieli kapitał ZUS (wspólna tablica)
w_dozycia_M = 65 + 198,00/12 = 81,5 lat     # mężczyzna statystycznie nie dożywa tego punktu
w_dozycia_K = 65 + 245,64/12 = 85,5 lat     # kobieta przekracza go o 3,9 roku
```

## Wynik w jednym zdaniu

Mężczyzna dostaje z ZUS **4 500 zł** miesięcznie, a gdyby ZUS uwzględnił jego czas życia
i policzył emeryturę tablicą męską, wyszłoby **5 061,36 zł**. W ciągu całego okresu emerytury,
w dzisiejszych złotówkach i z uwzględnieniem realnej waloryzacji emerytur (ok. 1,46% rocznie),
mężczyzna dostanie łącznie o **280 293 zł** mniej niż jego rówieśniczka na tych samych
warunkach. Przy 65 latach — realnym, ustawowym wieku emerytalnym mężczyzny — nie pojawia się
ostrzeżenie `MALE_AGE_HYPOTHETICAL`.

---

## Wariant: wiek 60 lat

Wiek 60 to jedyny wiek, dla którego `w` jest jednocześnie realnym, ustawowym wiekiem
emerytalnym — ale kobiety, nie mężczyzny (stąd ostrzeżenie `MALE_AGE_HYPOTHETICAL`: kolumna
męska pokazuje sam efekt wspólnej tablicy, nie realny scenariusz).

```
e_U = 268,9 mies.        e_M = 240,48 mies.        e_K = 296,52 mies.

K   = 4 500 zł × 268,9              = 1 210 050 zł        # odtworzony kapitał
E_M = 1 210 050 zł / 240,48         = 5 031,81 zł         # gdyby ZUS wziął tablicę męską

d_M      = 5 031,81 − 4 500         =   531,81 zł / mies.
u_M_mies = 531,81 / 5 031,81        = 10,57%              # o tyle niższa niż wg tablicy męskiej

suma(e_M) = 4 500 zł × [(1,0012114082)^240,48 − 1] / 0,0012114082 = 1 255 400,40 zł
suma(e_K) = 4 500 zł × [(1,0012114082)^296,52 − 1] / 0,0012114082 = 1 604 304,04 zł

D_para = 1 604 304,04 − 1 255 400,40 = 348 903,63 zł     → 348 904 zł

m_M = 28,42 miesięcznych emerytur       m_K = 27,62 miesięcznych emerytur
w_dozycia_U = 60 + 268,9/12  = 82,4 lat
w_dozycia_M = 60 + 240,48/12 = 80,0 lat
w_dozycia_K = 60 + 296,52/12 = 84,7 lat
```

## Pozostałe wieki (ten sam kapitał liczony osobno dla każdego wieku)

| Wiek `w` | `K` (kapitał) | `E_M` (miesięcznie) | `D_para` (cały okres emerytury) | `w_dożycia_U` | `w_dożycia_M` | `w_dożycia_K` |
| -------: | ------------: | ------------------: | ------------------------------: | ------------: | ------------: | ------------: |
|       60 |  1 210 050 zł |         5 031,81 zł |                      348 904 zł |          82,4 |          80,0 |          84,7 |
|       65 |  1 002 150 zł |         5 061,36 zł |                      280 293 zł |          83,6 |          81,5 |          85,5 |
|       70 |    812 700 zł |         5 069,24 zł |                      210 523 zł |          85,0 |          83,4 |          86,5 |
|       75 |    637 650 zł |         5 055,90 zł |                      148 344 zł |          86,8 |          85,5 |          87,8 |
|       80 |    478 800 zł |         5 031,53 zł |                       98 646 zł |          88,9 |          87,9 |          89,5 |

`E_M` rośnie z wiekiem do ok. 70 lat, a potem lekko maleje — to nie błąd, tylko realny kształt
tablic GUS: stosunek `e_U / e_M` (o ile miesięcy więcej dostaje mężczyzna wg tablicy wspólnej
niż wg własnej) nie jest idealnie monotoniczny w wieku. `D_para` maleje konsekwentnie, bo
z wiekiem kurczy się zarówno liczba miesięcy pobierania świadczenia, jak i rozjazd
`e_K − e_M` między tablicami.

---

> Wartości `e_M` i `e_K` pochodzą z arkusza GUS „Tablica A" z dokładnością do 0,01 roku
> (2 miejsca po przecinku), `e_U` — z komunikatu Prezesa GUS z dokładnością do 0,1 miesiąca.
> Testy piszemy przeciwko wartościom z pliku danych (`life-tables.ts`), a ten przykład
> aktualizujemy razem z nim.

Wartości powyżej są policzone dokładnie tymi samymi wzorami co w
[czas-zycia.ts](../src/lib/services/czas-zycia.ts); testy
([czas-zycia.test.ts](../src/lib/services/czas-zycia.test.ts)) weryfikują je z tolerancją
groszową (kwoty miesięczne) i złotówkową (sumy za cały okres emerytury).
