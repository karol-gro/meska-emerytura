# Przykład liczbowy krok po kroku

Pełne przeliczenie przykładu z [IKE-ALGORYTM.md](IKE-ALGORYTM.md) § 9 — mężczyzna z pensją
**8 000 zł netto** i założeniami domyślnymi. Szczegółowo liczymy wariant **30-latka**
(dokładnie 30 lat, miesiąc urodzenia = bieżący), na końcu tabela dla pozostałych wieków.

## Dane wejściowe i założenia

```
pensja_netto              = 8 000 zł / mies.
stopa_zastąpienia         = 50%    = 0,50
stopa_zwrotu_oszczędzania = 6,0%   = 0,060   (nominalna, rocznie)
stopa_zwrotu_wypłat       = 3,5%   = 0,035   (nominalna, rocznie)
inflacja                  = 2,5%   = 0,025   (rocznie)
waloryzacja_składek       = 4,5%   = 0,045   (nominalna, rocznie)
waloryzacja_emerytur      = 4,0%   = 0,040   (nominalna, rocznie)
skrócenie_dożycie         = 13%    = 0,13
wiek                      = 30 lat = 360 miesięcy
miesiące_luki             = 60     (5 lat między 60. a 65. urodzinami)
```

Wszystkie waloryzacje ≥ inflacja (4,5% i 4,0% > 2,5%), więc realnie są dodatnie — warunek z
[IKE-ALGORYTM.md](IKE-ALGORYTM.md) § 8 spełniony.

## Krok 0. Stopy nominalne → realne miesięczne

Wszystkie kwoty w aplikacji są w dzisiejszych złotówkach, więc stopy zwrotu **i waloryzacje**
musimy oczyścić z inflacji (wzór Fishera), a stopy zwrotu dodatkowo sprowadzić do miesiąca
(pierwiastek 12. stopnia).

### Faza oszczędzania (do 60. urodzin)

```
realna_roczna_oszczędzania = (1 + stopa_zwrotu_oszczędzania) / (1 + inflacja) − 1
                           = 1,060 / 1,025 − 1
                           = 0,0341463415                    ≈ 3,4146% rocznie

miesięczna_oszczędzania    = (1 + realna_roczna_oszczędzania)^(1/12) − 1
                           = 1,0341463415^(1/12) − 1
                           = 0,0028019428                    ≈ 0,2802% miesięcznie
```

### Faza wypłat (60–65 lat)

```
realna_roczna_wypłat = (1 + stopa_zwrotu_wypłat) / (1 + inflacja) − 1
                     = 1,035 / 1,025 − 1
                     = 0,0097560976                          ≈ 0,9756% rocznie

miesięczna_wypłat    = (1 + realna_roczna_wypłat)^(1/12) − 1
                     = 1,0097560976^(1/12) − 1
                     = 0,0008093952                          ≈ 0,0809% miesięcznie
```

### Waloryzacje realne (roczne — używane w krokach 1a i 1c)

```
waloryzacja_składek_real  = 1,045 / 1,025 − 1 = 0,0195121951  ≈ 1,9512% rocznie
waloryzacja_emerytur_real = 1,040 / 1,025 − 1 = 0,0146341463  ≈ 1,4634% rocznie
```

Intuicja: 6% zwrotu przy 2,5% inflacji to realnie tylko ~3,41% (nie 3,5% — dzielenie,
nie odejmowanie), a bezpieczne 3,5% w fazie wypłat realnie ledwo przekracza zero.

## Krok 1. Docelowa emerytura mężczyzny (w wieku 65)

```
docelowa_emerytura = stopa_zastąpienia × pensja_netto
                   = 0,50 × 8 000 zł
                   = 4 000 zł / mies.
```

To emerytura, jaką mężczyzna dostanie z ZUS w wieku 65 lat — **nie** kwota, którą musi sobie
wypłacać wcześniej. Tę liczymy w krokach 1a–1c.

## Krok 1a. Emerytura kobiety w wieku 60 (świadczenie startowe)

Kobieta w wieku 60 dostaje mniej: jej kapitał nie był waloryzowany przez ostatnie 5 lat
(dzielimy przez `(1 + waloryzacja_składek_real)^5`), a ten sam kapitał rozkłada się na dłuższe
dalsze trwanie życia (mnożymy przez `1 − skrócenie_dożycie`):

```
(1 + waloryzacja_składek_real)^5 = 1,0195121951^5 = 1,1014432

emerytura_K60 = docelowa_emerytura / 1,1014432 × (1 − 0,13)
              = 4 000 zł / 1,1014432 × 0,87
              = 3 631,60 zł × 0,87
              = 3 159,49 zł / mies.
```

## Krok 1b. Waloryzacja emerytury kobiety przez 5 lat (60–65)

Świadczenie kobiety jest co roku waloryzowane — realnie o `waloryzacja_emerytur_real`:

```
rok 1 (60–61): 3 159,49 × 1,0146341^0 = 3 159,49 zł
rok 2 (61–62): 3 159,49 × 1,0146341^1 = 3 205,73 zł
rok 3 (62–63): 3 159,49 × 1,0146341^2 = 3 252,64 zł
rok 4 (63–64): 3 159,49 × 1,0146341^3 = 3 300,24 zł
rok 5 (64–65): 3 159,49 × 1,0146341^4 = 3 348,54 zł
```

## Krok 1c. Uśrednione świadczenie do zastąpienia

Średnia z 5 rocznych poziomów — stałe (realnie) świadczenie, które musi zapewnić sobie mężczyzna:

```
suma_współczynników = (1,0146341^5 − 1) / 0,0146341 = 5,1484988      (Σ dla k = 0..4)

świadczenie_avg = emerytura_K60 × suma_współczynników / 5
                = 3 159,49 zł × 5,1484988 / 5
                = 3 159,49 zł × 1,0296998
                = 3 253,33 zł / mies.
```

Czyli mężczyzna zamiast naiwnych 4 000 zł musi odtworzyć **3 253,33 zł** — dokładnie tyle,
ile średnio dostaje w tych latach kobieta.

## Krok 2. Kapitał wymagany w dniu 60. urodzin — wynik główny nr 1

Potrzebujemy 60 comiesięcznych wypłat po `świadczenie_avg = 3 253,33 zł`, płatnych **z góry**
(pieniądze na życie potrzebne są na początku miesiąca). Kapitał, który jeszcze nie został
wypłacony, dalej pracuje na stopie `miesięczna_wypłat` — dlatego wystarczy mniej niż naiwne
60 × 3 253,33 zł.

Wzór na wartość obecną renty płatnej z góry:

```
kapitał_60 = świadczenie_avg × [(1 − (1 + miesięczna_wypłat)^(−60)) / miesięczna_wypłat] × (1 + miesięczna_wypłat)
```

Po kolei:

```
(1 + miesięczna_wypłat)^(−60) = 1,0008093952^(−60)      = 0,9526153560

licznik                       = 1 − 0,9526153560        = 0,0473846440

współczynnik_renty            = 0,0473846440 / 0,0008093952
                              = 58,543271                 (renta płatna z dołu)

współczynnik_renty_z_góry     = 58,543271 × 1,0008093952
                              = 58,590655

kapitał_60 = 3 253,33 zł × 58,590655 = 190 614,57 zł  ≈  190 600 zł
```

Sprawdzenie intuicji: 58,59 „efektywnych miesięcy" zamiast 60 — kapitał pracujący w fazie
wypłat oszczędza równowartość ~1,4 miesięcznej wypłaty (195 200 − 190 615 ≈ 4 585 zł).

## Krok 3. Długość fazy oszczędzania

```
wiek_w_miesiącach    = 30 lat × 12 = 360
miesiące_oszczędzania = 60 × 12 − wiek_w_miesiącach = 720 − 360 = 360
```

## Krok 4. Miesięczna wpłata na IKE — wynik główny nr 2

Szukamy stałej (realnie) wpłaty na koniec każdego miesiąca, której wartość przyszła po
360 miesiącach na stopie `miesięczna_oszczędzania` da dokładnie `kapitał_60`:

```
wpłata_miesięczna = kapitał_60 × miesięczna_oszczędzania / ((1 + miesięczna_oszczędzania)^360 − 1)
```

Po kolei:

```
(1 + miesięczna_oszczędzania)^360 = 1,0028019428^360 = 2,738167
   (każda złotówka wpłacona na starcie urośnie realnie prawie ×2,74)

mianownik = 2,738167 − 1 = 1,738167

wpłata_miesięczna = 190 614,57 zł × 0,0028019428 / 1,738167
                  = 534,10 / 1,738167
                  = 307,27 zł / mies.  ≈  307 zł
```

## Krok 5. Wyniki pochodne

```
udział_w_pensji = wpłata_miesięczna / pensja_netto = 307,27 / 8 000 = 3,84%
wpłata_roczna   = wpłata_miesięczna × 12           = 3 687,27 zł    (limit IKE 28 260 zł — OK)
suma_wpłat      = wpłata_miesięczna × 360          = 110 618 zł     (z własnej kieszeni)
wynik_kobiety   = 0 zł                              (zawsze)
```

Czyli: 30-latek wpłaca przez 30 lat łącznie **110 618 zł**, a rynek dokłada brakujące
**79 997 zł** (190 615 − 110 618) — wszystko po to, żeby móc przejść na emeryturę
w tym samym wieku co kobieta, która nie wpłaca nic.

## Pozostałe wieki startu (ten sam kapitał_60 = 190 614,57 zł)

Zmienia się tylko `miesiące_oszczędzania` i w konsekwencji wpłata:

| Wiek | Miesiące oszczędzania |  (1+q)^n | Wpłata / mies. |      Rocznie | Suma wpłat | Udział w pensji | Limit IKE (28 260 zł) |
| ---: | --------------------: | -------: | -------------: | -----------: | ---------: | --------------: | :-------------------- |
|   25 |                   420 | 3,238695 |      238,57 zł |  2 862,87 zł | 100 200 zł |           2,98% | OK                    |
|   30 |                   360 | 2,738167 |      307,27 zł |  3 687,27 zł | 110 618 zł |           3,84% | OK                    |
|   40 |                   240 | 1,957222 |      557,96 zł |  6 695,52 zł | 133 910 zł |           6,97% | OK                    |
|   50 |                   120 | 1,399007 |    1 338,55 zł | 16 062,59 zł | 160 626 zł |          16,73% | OK                    |
|   55 |                    60 | 1,182796 |    2 921,78 zł | 35 061,37 zł | 175 307 zł |          36,52% | **przekroczony** ⚠    |

Przy starcie w wieku 55 lat pojawiają się oba ostrzeżenia: roczna wpłata przekracza limit
IKE (nadwyżkę trzeba odkładać poza IKE), a przy późniejszym starcie (mniej niż 60 miesięcy
do 60. urodzin) doszłoby ryzyko niespełnienia warunku 5 lat kalendarzowych wpłat.

---

Po zmianie kodu (na razie zmieniamy tylko dokumenty) wartości będą policzone dokładnie tymi
samymi wzorami co [calculator.ts](../src/lib/services/calculator.ts); testy w
[calculator.test.ts](../src/lib/services/calculator.test.ts) zweryfikują je z tolerancją 0,5%.
