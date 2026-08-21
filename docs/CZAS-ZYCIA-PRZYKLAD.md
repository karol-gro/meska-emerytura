# Przykład liczbowy krok po kroku

Pełne przeliczenie przykładu z [CZAS-ZYCIA-ALGORYTM.md](CZAS-ZYCIA-ALGORYTM.md) § 10 —
mężczyzna z prognozowaną emeryturą **4 500 zł brutto** w wieku **60 lat** i założeniami
domyślnymi. Wiek 60 to jedyny wiersz, dla którego mamy dziś komplet potwierdzonych wartości
GUS (§ 4 algorytmu); dla mężczyzny jest to wiek hipotetyczny (ostrzeżenie
`MALE_AGE_HYPOTHETICAL`), pokazujący sam efekt wspólnej tablicy.

## Dane wejściowe i założenia

```
prognoza_E = 4 500 zł / mies.
wiek_w     = 60 lat
wal_e      = 4,0%   (nominalna roczna waloryzacja emerytur)
i          = 2,5%   (inflacja roczna)
```

## Krok 0. Tablice dla wieku 60

```
e_U = 268,9 mies.        e_M = 240,0 mies. (20,0 lat)        e_K = 296,4 mies. (24,7 lat)
```

Niezmiennik `e_M < e_U < e_K` spełniony: 240,0 < 268,9 < 296,4.

## Krok 1. Realna waloryzacja emerytur

```
wal_e_real = 1,04 / 1,025 − 1 = 0,0146341463          ≈ 1,4634% rocznie
q_e        = 1,0146341463^(1/12) − 1 = 0,0012114082    ≈ 0,1211% miesięcznie
```

## Krok 2. Odtworzenie kapitału

```
K = 4 500 zł × 268,9 = 1 210 050 zł
```

## Krok 3. Emerytura wg tablicy męskiej — wynik główny nr 2

```
E_M = 1 210 050 zł / 240,0 = 5 041,875 zł        → 5 041,88 zł
```

## Krok 4. Różnica miesięczna

```
d_M      = 5 041,88 − 4 500 = 541,88 zł / mies.
u_M_mies = 541,88 / 5 041,88 = 0,107487           ≈ 10,75%
```

Kontrola drugim wzorem: `1 − e_M / e_U = 1 − 240,0 / 268,9 = 0,107475 ≈ 10,75%` (zgodne
z dokładnością zaokrągleń).

## Krok 5. Transfer za cały okres emerytury — wynik główny nr 1

Renta rosnąca `suma(e) = E × [(1 + q_e)^e − 1] / q_e`:

```
suma(e_M) = 4 500 zł × [(1,0012114082)^240   − 1] / 0,0012114082 = 1 252 513,01 zł
suma(e_K) = 4 500 zł × [(1,0012114082)^296,4 − 1] / 0,0012114082 = 1 603 531,34 zł

D_para = 1 603 531,34 − 1 252 513,01 = 351 018,34 zł    → 351 018 zł
```

Kontrola (nominalnie, bez waloryzacji — `q_e = 0`): `4 500 × (296,4 − 240,0) = 253 800 zł`.
Realna waloryzacja podnosi różnicę o ~38%, bo dodatkowe miesiące kobiety (`e_K − e_M`) przypadają
na później, gdy świadczenie jest już wyżej zwaloryzowane.

## Krok 6. Wyniki pochodne

```
m_M = 268,9 − 240,0 = 28,9 miesięcznych emerytur
m_K = 296,4 − 268,9 = 27,5 miesięcznych emerytur

w_zwrot     = 60 + 268,9/12 = 82,4 lat     # dopiero wtedy emeryt odbiera cały swój kapitał (bez waloryzacji)
w_dozycia_M = 60 + 240,0/12 = 80,0 lat     # mężczyzna statystycznie nie dożywa tego punktu
w_dozycia_K = 60 + 296,4/12 = 84,7 lat     # kobieta przekracza go o 2,3 roku
```

## Wynik w jednym zdaniu

Mężczyzna dostaje z ZUS **4 500 zł** miesięcznie, a gdyby ZUS uwzględnił jego czas życia
i policzył emeryturę tablicą męską, wyszłoby **5 041,88 zł**. W ciągu całego okresu emerytury,
w dzisiejszych złotówkach i z uwzględnieniem realnej waloryzacji emerytur (ok. 1,46% rocznie),
mężczyzna dostanie łącznie o **351 018 zł** mniej niż jego rówieśniczka na tych samych
warunkach.

---

> Wartości `e_M` i `e_K` pochodzą z komunikatu GUS z dokładnością do 0,1 roku. Po przepisaniu
> tablic z plików źródłowych (2 miejsca po przecinku) wyniki drgną o ułamek procenta — testy
> piszemy przeciwko wartościom z pliku danych, a ten przykład aktualizujemy razem z nim.

Wartości powyżej są policzone dokładnie tymi samymi wzorami co w
[czas-zycia.ts](../src/lib/services/czas-zycia.ts); testy
([czas-zycia.test.ts](../src/lib/services/czas-zycia.test.ts)) weryfikują je z tolerancją
groszową (kwoty miesięczne) i złotówkową (sumy za cały okres emerytury).
