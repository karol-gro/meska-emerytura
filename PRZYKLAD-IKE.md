# Przykład liczbowy krok po kroku

Pełne przeliczenie przykładu z [ALGORYTM-IKE.md](ALGORYTM-IKE.md) § 10 — mężczyzna z pensją
**8 000 zł netto** i założeniami domyślnymi. Szczegółowo liczymy wariant **30-latka**
(dokładnie 30 lat, miesiąc urodzenia = bieżący), na końcu tabela dla pozostałych wieków.

## Dane wejściowe i założenia

```
pensja_netto              = 8 000 zł / mies.
stopa_zastąpienia         = 50%    = 0,50
stopa_zwrotu_oszczędzania = 6,0%   = 0,060   (nominalna, rocznie)
stopa_zwrotu_wypłat       = 3,5%   = 0,035   (nominalna, rocznie)
inflacja                  = 2,5%   = 0,025   (rocznie)
wiek                      = 30 lat = 360 miesięcy
miesiące_luki             = 60     (5 lat między 60. a 65. urodzinami)
```

## Krok 0. Stopy nominalne → realne miesięczne

Wszystkie kwoty w aplikacji są w dzisiejszych złotówkach, więc stopy zwrotu musimy
oczyścić z inflacji (wzór Fishera), a potem sprowadzić do miesiąca (pierwiastek 12. stopnia).

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

Intuicja: 6% zwrotu przy 2,5% inflacji to realnie tylko ~3,41% (nie 3,5% — dzielenie,
nie odejmowanie), a bezpieczne 3,5% w fazie wypłat realnie ledwo przekracza zero.

## Krok 1. Docelowa emerytura

```
docelowa_emerytura = stopa_zastąpienia × pensja_netto
                   = 0,50 × 8 000 zł
                   = 4 000 zł / mies.
```

## Krok 2. Kapitał wymagany w dniu 60. urodzin — wynik główny nr 1

Potrzebujemy 60 comiesięcznych wypłat po 4 000 zł, płatnych **z góry** (pieniądze na życie
potrzebne są na początku miesiąca). Kapitał, który jeszcze nie został wypłacony, dalej
pracuje na stopie `miesięczna_wypłat` — dlatego wystarczy mniej niż naiwne 60 × 4 000 zł.

Wzór na wartość obecną renty płatnej z góry:

```
kapitał_60 = docelowa_emerytura × [(1 − (1 + miesięczna_wypłat)^(−60)) / miesięczna_wypłat] × (1 + miesięczna_wypłat)
```

Po kolei:

```
(1 + miesięczna_wypłat)^(−60) = 1,0008093952^(−60)      = 0,9526153560

licznik                       = 1 − 0,9526153560        = 0,0473846440

współczynnik_renty            = 0,0473846440 / 0,0008093952
                              = 58,543271                 (renta płatna z dołu)

współczynnik_renty_z_góry     = 58,543271 × 1,0008093952
                              = 58,590655

kapitał_60 = 4 000 zł × 58,590655 = 234 362,62 zł  ≈  234 400 zł
```

Sprawdzenie intuicji: 58,59 „efektywnych miesięcy" zamiast 60 — kapitał pracujący w fazie
wypłat oszczędza równowartość ~1,4 miesięcznej wypłaty (240 000 − 234 363 ≈ 5 637 zł).

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
   (każda złotówka wpłacona na starcie potroi się prawie ×2,74 — realnie!)

mianownik = 2,738167 − 1 = 1,738167

wpłata_miesięczna = 234 362,62 zł × 0,0028019428 / 1,738167
                  = 656,66 / 1,738167
                  = 377,79 zł / mies.  ≈  378 zł
```

## Krok 5. Wyniki pochodne

```
udział_w_pensji = wpłata_miesięczna / pensja_netto = 377,79 / 8 000 = 4,72%
wpłata_roczna   = wpłata_miesięczna × 12           = 4 533,54 zł    (limit IKE 28 260 zł — OK)
suma_wpłat      = wpłata_miesięczna × 360          = 136 006 zł     (z własnej kieszeni)
wynik_kobiety   = 0 zł                              (zawsze)
```

Czyli: 30-latek wpłaca przez 30 lat łącznie **136 006 zł**, a rynek dokłada brakujące
**98 357 zł** (234 363 − 136 006) — wszystko po to, żeby móc przejść na emeryturę
w tym samym wieku co kobieta, która nie wpłaca nic.

## Pozostałe wieki startu (ten sam kapitał_60 = 234 362,62 zł)

Zmienia się tylko `miesiące_oszczędzania` i w konsekwencji wpłata:

| Wiek | Miesiące oszczędzania |  (1+q)^n | Wpłata / mies. |      Rocznie | Suma wpłat | Udział w pensji | Limit IKE (28 260 zł) |
| ---: | --------------------: | -------: | -------------: | -----------: | ---------: | --------------: | :-------------------- |
|   25 |                   420 | 3,238695 |      293,33 zł |  3 519,93 zł | 123 198 zł |           3,67% | OK                    |
|   30 |                   360 | 2,738167 |      377,79 zł |  4 533,54 zł | 136 006 zł |           4,72% | OK                    |
|   40 |                   240 | 1,957222 |      686,02 zł |  8 232,21 zł | 164 644 zł |           8,58% | OK                    |
|   50 |                   120 | 1,399007 |    1 645,76 zł | 19 749,13 zł | 197 491 zł |          20,57% | OK                    |
|   55 |                    60 | 1,182796 |    3 592,36 zł | 43 108,33 zł | 215 542 zł |          44,90% | **przekroczony** ⚠    |

Przy starcie w wieku 55 lat pojawiają się oba ostrzeżenia: roczna wpłata przekracza limit
IKE (nadwyżkę trzeba odkładać poza IKE), a przy późniejszym starcie (mniej niż 60 miesięcy
do 60. urodzin) doszłoby ryzyko niespełnienia warunku 5 lat kalendarzowych wpłat.

---

Wartości policzone dokładnie tymi samymi wzorami co [calculator.ts](src/lib/services/calculator.ts);
testy w [calculator.test.ts](src/lib/services/calculator.test.ts) weryfikują je z tolerancją 0,5%.
