# Algorytm: ile mężczyzna dokłada do systemu przez wspólną (unisex) tablicę dalszego trwania życia

## 1. Cel i kontekst

Emerytura z ZUS to prosty podział: **zgromadzony kapitał ÷ średnie dalsze trwanie życia
w miesiącach** (art. 26 ustawy o emeryturach i rentach z FUS). Liczba miesięcy pochodzi
z tablicy, którą Prezes GUS ogłasza co roku do 31 marca (obowiązuje od 1 kwietnia do
31 marca następnego roku) — i ta tablica jest **wspólna dla kobiet i mężczyzn (unisex)**,
choć umieralność obu płci jest wyraźnie różna.

Skutek — w jednym zdaniu: przy tym samym wieku przejścia na emeryturę i tej samej
prognozowanej wysokości świadczenia mężczyzna i kobieta dostają z ZUS **tyle samo
miesięcznie**, ale kobieta statystycznie pobiera to świadczenie **dłużej** — a że emerytury
są co roku waloryzowane, ta dodatkowa końcówka pobierania przypada na lata już wyższych,
zwaloryzowanych kwot. Łącznie, w dzisiejszych złotówkach, kobieta **dostanie więcej niż
mężczyzna**, i to więcej, niż wynikałoby z samej różnicy liczby miesięcy. Gdyby ZUS
uwzględnił rzeczywisty czas życia mężczyzny (czyli policzył jego emeryturę tablicą męską
zamiast wspólnej), efekt przeniósłby się z sumy na kwotę miesięczną — w drugą stronę: dostawałby
**więcej** miesięcznie, bo statystycznie krócej pobiera świadczenie.

- **Mężczyzna** dostaje kapitał podzielony przez **więcej** miesięcy, niż statystycznie
  przeżyje — jego świadczenie miesięczne jest niższe od „własnego" (`E` vs `E_M` niżej).
- **Kobieta** dostaje kapitał podzielony przez **mniej** miesięcy, niż statystycznie przeżyje
  — jej świadczenie miesięczne jest wyższe od „własnego", a po wyczerpaniu kapitału pobiera
  je dalej.

To transfer w drugą stronę niż różnica wieku emerytalnego (tam mężczyzna pracuje 5 lat dłużej),
ale mechanizm jest ten sam: **jedna liczba w ustawie przenosi pieniądze między płciami**.
Kalkulator wydobywa ją na wierzch — z jednej prognozy emerytury liczy:

1. o ile **mężczyzna dostanie łącznie mniej niż kobieta** przez cały okres pobierania
   świadczenia, w dzisiejszych złotówkach i z uwzględnieniem realnej waloryzacji emerytur
   (ta sama kwota miesięczna na starcie, ale statystycznie krótszy okres jej pobierania,
   a do tego pomija końcówkę już wyższych, zwaloryzowanych wypłat),
2. ile wynosiłaby jego miesięczna emerytura, **gdyby ZUS uwzględnił czas życia** i policzył
   ją **tablicą męską**.

### Uwaga o samej zasadzie

Wspólna tablica nie jest błędem rachunkowym, tylko decyzją ustawodawcy — w ubezpieczeniach
społecznych taryfy różnicowane ze względu na płeć są w UE zakazane (wyrok TSUE C-318/13).
Kalkulator **wycenia** tę zasadę, a nie postuluje jej zmianę: pokazuje, ile kosztuje i kogo.

## 2. Dane wejściowe (podaje użytkownik)

| Symbol | Nazwa                             | Zakres            | Uwagi                                                                                          |
| ------ | --------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| `E`    | Prognozowana emerytura miesięczna | 1 000 – 20 000 zł | brutto, tak jak podaje ją kalkulator ZUS / „Twoja przyszła emerytura" w eZUS; patrz decyzja D1 |
| `w`    | Wiek przejścia na emeryturę       | 60 – 80 lat       | pełne lata; domyślnie 65 (ustawowy wiek mężczyzny), 60 to wiek ustawowy kobiety                |

Poza tymi dwoma wejściami kalkulator ma jedno dodatkowe założenie edytowalne — realną
waloryzację emerytur (§ 3) — potrzebne wyłącznie do przeliczenia **łącznej różnicy** za cały
okres emerytury (wynik główny nr 1, krok 5). Wartość miesięczna `E_M` (wynik 2) nadal zależy
wyłącznie od dwóch powyższych wejść i urzędowych tablic z § 4 — tej części wyniku nie da się
podważyć doborem założeń.

## 3. Założenia edytowalne (proponujemy domyślną wartość, użytkownik może zmienić)

| Symbol  | Nazwa                                     | Domyślnie | Opis                                                                                                                                     |
| ------- | ----------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `wal_e` | **Nominalna** roczna waloryzacja emerytur | 4,0%      | ten sam parametr co w [IKE-ALGORYTM.md](IKE-ALGORYTM.md) (§ 3) — o ile rośnie już wypłacana emerytura; wartość robocza, do potwierdzenia |
| `i`     | Inflacja roczna                           | 2,5%      | cel inflacyjny NBP; wspólna z resztą aplikacji                                                                                           |

> **Uwaga.** `wal_e` podaje się **nominalnie**, ale różnica z kroku 5 liczona jest **realnie**
> (w dzisiejszych złotówkach) — waloryzację przeliczamy wzorem Fishera przez inflację `i`
> (§ 7, krok 1), dokładnie tak jak `wal_e` w IKE-ALGORYTM. Podobnie jak tam, **nominalna
> waloryzacja nie może być niższa od inflacji** (gwarancja ustawowa emerytur) — patrz
> walidacje w § 9.

## 4. Dane źródłowe — tablice dalszego trwania życia

Algorytm potrzebuje trzech funkcji wieku, wyrażonych **w miesiącach**:

| Symbol | Tablica                                 | Źródło                                                                                                                                |
| ------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `e_U`  | wspólna (unisex) — ta, której używa ZUS | Komunikat Prezesa GUS z 25 marca 2026 r. (M.P. 2026 poz. 319), tablica obowiązująca **1.04.2026 – 31.03.2027**; wartości w miesiącach |
| `e_M`  | mężczyźni                               | GUS, „Trwanie życia w 2025 r." — tablice trwania życia, `e_x` w latach (2 miejsca po przecinku) → mnożymy przez 12                    |
| `e_K`  | kobiety                                 | jw., tablica dla kobiet — potrzebna do policzenia `D_para` (krok 5)                                                                   |

Zasady doboru danych:

- **Jeden rocznik po obu stronach.** Tablica unisex ogłoszona w marcu 2026 i tablice płci
  za 2025 r. opisują tę samą umieralność; nie wolno mieszać roczników, bo różnica
  `e_K − e_M` przestaje być czysta. Przy transkrypcji sprawdzić rocznik w „Wyjaśnieniach do
  tablicy średniego dalszego trwania życia" GUS.
- **`e_U` nie jest średnią arytmetyczną `e_M` i `e_K`** — to tablica policzona dla łącznej
  populacji, więc leży między nimi, ale bliżej wartości kobiet (kobiet w tym wieku żyje
  więcej). Bierzemy wartości opublikowane, niczego nie uśredniamy.
- **Aktualizacja:** `e_U` co roku 1 kwietnia, `e_M`/`e_K` po lipcowej publikacji GUS. Rocznik
  tablic trzymamy w stałej `TABLICE_ROCZNIK` i pokazujemy w UI (jak datę kursu walut).

Pełna tablica (wiek 60–80, stan na sierpień 2026) — dokładnie te same wartości są przepisane
do `src/lib/services/life-tables.ts`:

| Wiek `w` | `e_U` (unisex) | `e_M` (mężczyźni) | `e_K` (kobiety) |
| -------: | -------------: | ----------------: | --------------: |
|       60 |    268,9 mies. |      240,48 mies. |    296,52 mies. |
|       61 |    259,4 mies. |      231,60 mies. |    286,08 mies. |
|       62 |    250,0 mies. |      222,84 mies. |    275,76 mies. |
|       63 |    240,7 mies. |      214,32 mies. |    265,56 mies. |
|       64 |    231,7 mies. |      206,04 mies. |    255,60 mies. |
|       65 |    222,7 mies. |      198,00 mies. |    245,64 mies. |
|       66 |    214,1 mies. |      190,08 mies. |    235,92 mies. |
|       67 |    205,4 mies. |      182,40 mies. |    226,20 mies. |
|       68 |    197,0 mies. |      174,96 mies. |    216,72 mies. |
|       69 |    188,8 mies. |      167,64 mies. |    207,24 mies. |
|       70 |    180,6 mies. |      160,32 mies. |    198,00 mies. |
|       71 |    172,6 mies. |      153,24 mies. |    188,88 mies. |
|       72 |    164,6 mies. |      146,28 mies. |    180,00 mies. |
|       73 |    156,8 mies. |      139,44 mies. |    171,12 mies. |
|       74 |    149,2 mies. |      132,72 mies. |    162,48 mies. |
|       75 |    141,7 mies. |      126,12 mies. |    153,96 mies. |
|       76 |    134,3 mies. |      119,64 mies. |    145,68 mies. |
|       77 |    127,1 mies. |      113,28 mies. |    137,64 mies. |
|       78 |    120,0 mies. |      107,04 mies. |    129,72 mies. |
|       79 |    113,2 mies. |      101,04 mies. |    122,04 mies. |
|       80 |    106,4 mies. |       95,16 mies. |    114,48 mies. |

`e_U` przepisane wprost z załącznika do komunikatu (kolumna „0 miesięcy ukończonych powyżej
pełnego roku życia"); `e_M`/`e_K` przepisane z kolumny `ex` (arkusze „Ogółem mężczyźni" /
„Ogółem kobiety") Tablicy A i pomnożone przez 12. Niezmiennik `e_M < e_U < e_K` spełniony dla
wszystkich 21 wierszy (test danych, § 11).

Pliki źródłowe: komunikat w [M.P. 2026 poz. 319](https://monitorpolski.gov.pl/MP/2026/319)
(także [ISAP](https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WMP20260000319)),
[lista komunikatów GUS](https://stat.gov.pl/sygnalne/komunikaty-i-obwieszczenia/lista-komunikatow-i-obwieszczen/komunikat-w-sprawie-tablicy-sredniego-dalszego-trwania-zycia-kobiet-i-mezczyzn,285,11.html)
wraz z [wyjaśnieniami metodologicznymi](https://stat.gov.pl/files/gfx/portalinformacyjny/pl/defaultaktualnosci/5463/285/13/1/tab_sr_dal_trw_zycia_wyjasnienia.pdf),
a tablice dla płci — w publikacji GUS „Trwanie życia w 2025 r." (obszar tematyczny
Ludność → Trwanie życia), plik „Tablica A" (arkusze „Ogółem mężczyźni"/„Ogółem kobiety").

Dla porządku: poprzednia tablica unisex (do 31.03.2026) dawała 266,4 mies. w wieku 60 lat
i 220,8 mies. w wieku 65 lat, więc świadczenia liczone po 1 kwietnia 2026 są o ~1% niższe.

## 5. Stałe systemowe (konfiguracja aplikacji, nie do edycji przez użytkownika)

| Stała               | Wartość               | Uwagi                                                                                   |
| ------------------- | --------------------- | --------------------------------------------------------------------------------------- |
| `WIEK_EMERYTALNY_M` | 65                    | ustawowy wiek emerytalny mężczyzn                                                       |
| `WIEK_RANGE`        | 60 – 80 lat           | zakres suwaka wieku; dolna granica = najwcześniejszy wiek emerytalny w systemie         |
| `EMERYTURA_RANGE`   | 1 000 – 20 000 zł     | zakres suwaka prognozy; domyślnie 4 500 zł (≈ przeciętna emerytura po waloryzacji 2026) |
| `TABLICE_ROCZNIK`   | 2026/2027 (dane 2025) | rocznik wczytanych tablic; do pokazania w UI i do testu spójności                       |

## 6. Kluczowe decyzje projektowe

### D1. Wejściem jest prognoza świadczenia, nie kapitał

Nikt nie zna z pamięci swojego kapitału emerytalnego, ale prognozę świadczenia dostaje
z kalkulatora ZUS albo z informacji o stanie konta. Kapitał **odtwarzamy**, odwracając wzór
ZUS (`K = E × e_U`, krok 2). Wszystkie wyniki są liniowe w `E`, więc miara względna
(`u_M_mies`) i liczby miesięcy nie zależą od wpisanej kwoty. Trzymamy się konsekwentnie
**brutto** — tak raportuje prognozy ZUS, a netto nie jest stałą częścią brutto (kwota wolna,
składka zdrowotna), więc mieszanie obu jednostek zniekształciłoby kwoty transferu.

### D2. Ten sam wiek i ta sama prognoza dla obu płci

Porównanie „kobieta w wieku 60 vs mężczyzna w wieku 65" miesza dwa efekty: różnicę wieku
i różnicę tablic. Tutaj interesuje nas **wyłącznie tablica**, więc obie strony liczymy dla
tego samego wieku i tej samej prognozy. Efekt wieku emerytalnego jest tematem pozostałych
dwóch kalkulatorów (IKE, PIT-0).

### D3. Perspektywa mężczyzny, z jedną liczbą porównawczą do kobiety

Kalkulator opowiada o jednej osobie — mężczyźnie: ile faktycznie dostaje (`E`), ile
dostawałby, gdyby ZUS uwzględnił jego czas życia (`E_M`), i o ile mniej — łącznie, przez całą
emeryturę — dostanie od tego, co przy tych samych wejściach dostanie statystyczna kobieta
(`D_para`). Nie pokazujemy osobno hipotetycznej miesięcznej emerytury kobiety (`E_K`) ani
tego, ile ona „nadwyżkowo" pobiera — to nie jest clou tego kalkulatora, a dodatkowa liczba
tylko rozmywa przekaz. Tablica `e_K` nadal wchodzi do obliczeń (jest potrzebna do policzenia
`D_para`, krok 5) — po prostu nie pokazujemy jej miesięcznej pochodnej ani osobnego „ile
mężczyzna zostawia w systemie".

### D4. Suma z realną waloryzacją emerytur, w dzisiejszych złotówkach

`D_para` z kroku 5 liczymy jako różnicę dwóch **rent rosnących**: świadczenie w kolejnych
miesiącach rośnie o realną waloryzację `wal_e_real` (§ 3, § 7 krok 1), a różnicę podajemy
w **dzisiejszych złotówkach** — bez dodatkowego dyskontowania stopą zwrotu. Dwa powody na
„bez dyskontowania": sam ZUS nie dyskontuje (wzór `kapitał ÷ miesiące` to czysty podział, bez
stopy zwrotu), a wynik czyta się wprost jako „ile dziś warta jest różnica między tym, co
łącznie dostanie kobieta, a tym, co dostanie mężczyzna". Powód na „z waloryzacją": świadczenia
z ZUS są co roku waloryzowane **powyżej inflacji** (gwarancja ustawowa, § 3), więc pomijanie
tego przy 20–25-letnim okresie pobierania świadczenia systematycznie zaniża różnicę — bo
dłuższy okres pobierania kobiety ma proporcjonalnie więcej lat już wyżej zwaloryzowanych
wypłat.

Kompromis, o którym warto pamiętać: w przeciwieństwie do `E_M` (wynik punktowy, zależny
wyłącznie od tablic GUS), `D_para` **zależy od przyjętej stopy waloryzacji** — inny wybór
`wal_e` daje inną kwotę. Kierunek (kobieta dostaje więcej) jest odporny na wybór stopy —
`suma()` rośnie z liczbą miesięcy niezależnie od znaku `q_e`, a kobieta zawsze ma ich więcej
— ale konkretna kwota nie. W UI warto to zaznaczyć (np. etykietą „szacunek" przy sumie
łącznej, w odróżnieniu od „z oficjalnych tablic GUS" przy `E_M`).

### D5. Tablice okresowe (takie, jakich używa ZUS), nie kohortowe

Tablica GUS opisuje umieralność z jednego roku („co by było, gdyby warunki się nie zmieniły"),
a nie prognozę dla konkretnego rocznika. Realnie dzisiejsi 60-latkowie pożyją dłużej. Stosujemy
ją jednak symetrycznie po obu stronach i dokładnie tak, jak robi to ZUS — dzięki temu wyniki
odtwarzają decyzję urzędu, a nie naszą prognozę demograficzną.

### D6. Wiek w pełnych latach

Tablica ZUS ma granulację miesięczną (wiek w ukończonych latach i miesiącach), tablice GUS dla
płci — roczną. Schodzimy do wspólnego mianownika: pełne lata, czyli wiersz „`w` lat i 0 miesięcy"
z tablicy unisex. Bez tego trzeba by interpolować jedną stronę porównania, a więc dokładać
własne założenie tam, gdzie chcemy mieć wyłącznie dane urzędowe.

### D7. Miara względna odniesiona do „własnej" tablicy

Jak w kalkulatorze PIT-0 (D4), punktem odniesienia jest to, ile mężczyzna dostałby, gdyby
system liczył go jego własną (męską) tablicą:

```
u_M_mies = (E_M − E) / E_M      # o ile % niższą emeryturę ma mężczyzna niż wg tablicy męskiej
```

### Czego model nie obejmuje

- **Renty rodzinnej i renty wdowiej** — po śmierci mężczyzny część jego świadczenia wraca do
  gospodarstwa domowego (najczęściej do wdowy). Model tego nie liczy.
- **Umieralności różnicowanej inaczej niż płcią** (wykształcenie, zawód, region) — tablica
  unisex uśrednia także te różnice, tyle że nikt ich nie kodyfikuje w ustawie.
- **Kapitału osób, które nie dożyją emerytury** — tam mężczyzna zostawia w systemie całość
  (poza dziedziczonym subkontem), więc rzeczywisty transfer jest jeszcze większy niż liczony tutaj.
- **Rozrzutu indywidualnych długości życia** — `e_M` i `e_K` to wartości oczekiwane; konkretny
  mężczyzna może pobierać emeryturę 30 lat, a konkretna kobieta rok.
- **Przeliczeń świadczenia** (dalsza praca na emeryturze, emerytury pomostowe, korzystniejsza
  tablica z dnia osiągnięcia wieku emerytalnego) — liczymy jedno przyznanie świadczenia
  na tablicy bieżącej.
- **Zmienności w czasie realnej waloryzacji emerytur** — realnie polityka waloryzacyjna zmienia
  się z roku na rok (zależy m.in. od wzrostu płac); model tego nie liczy, tylko zakłada jedną
  **stałą** stopę `wal_e` przez cały 20–25-letni okres pobierania świadczenia. To większe
  uproszczenie niż analogiczne założenie w IKE-ALGORYTM, gdzie taki sam typ stopy działa na
  dużo krótszym, 5-letnim moście.

## 7. Algorytm — krok po kroku

### Krok 0. Odczyt tablic dla wieku `w`

```
e_U = TABLICA_UNISEX[w]         # miesiące, wprost z komunikatu GUS
e_M = TABLICA_M[w] × 12         # GUS podaje lata → miesiące
e_K = TABLICA_K[w] × 12
```

Niezmiennik danych (pilnowany testem, nie gałęzią w kodzie): `e_M < e_U < e_K`.

### Krok 1. Realna waloryzacja emerytur (miesięcznie)

```
wal_e_real = (1 + wal_e) / (1 + i) − 1       # realna roczna waloryzacja emerytur (≥ 0, patrz § 9)
q_e        = (1 + wal_e_real)^(1/12) − 1      # realna miesięczna waloryzacja (przybliżenie:
                                                # ustawowa waloryzacja raz w roku, w marcu —
                                                # tu rozkładamy ją równomiernie na miesiące)
```

### Krok 2. Odtworzenie kapitału — podstawa obliczenia emerytury

Odwrócenie wzoru ZUS `E = K / e_U`:

```
K = E × e_U
```

### Krok 3. Emerytura wg tablicy męskiej — **wynik główny nr 2**

```
E_M = K / e_M = E × e_U / e_M          # e_M < e_U, więc E_M > E
```

### Krok 4. Różnica miesięczna

```
d_M = E_M − E        # ile miesięcznie zabiera mężczyźnie wspólna tablica
```

### Krok 5. Transfer za cały okres emerytury — **wynik główny nr 1**

Mężczyzna pobiera świadczenie średnio przez `e_M` miesięcy, kobieta przez `e_K` miesięcy —
w obu przypadkach świadczenie w trakcie pobierania rośnie realnie o `q_e` miesięcznie (renta
rosnąca, różnica bez dyskontowania — § 6, D4):

```
suma(e) = E × [ (1 + q_e)^e − 1 ] / q_e      dla q_e ≠ 0    # łączna wartość e wypłat, dziś. zł
suma(e) = E × e                               dla q_e = 0

D_para = suma(e_K) − suma(e_M)      # o ile więcej łącznie dostanie kobieta niż mężczyzna
```

### Krok 6. Wyniki pochodne (do prezentacji)

```
u_M_mies    = d_M / E_M = 1 − e_M / e_U        # „podatek od płci" mężczyzny, punktowo (miesięcznie)
m_M         = e_U − e_M                         # ile miesięcznych emerytur „traci" mężczyzna względem wspólnej tablicy
m_K         = e_K − e_U                         # ile dodatkowych miesięcznych emerytur pobiera kobieta
w_zwrot     = w + e_U / 12                      # wiek, w którym emeryt odbiera cały swój kapitał
w_dozycia_M = w + e_M / 12                      # statystyczny wiek dożycia mężczyzny
w_dozycia_K = w + e_K / 12                      # statystyczny wiek dożycia kobiety
```

Para `w_zwrot` vs `w_dozycia_M` / `w_dozycia_K` daje najbardziej namacalny wynik: do jakiego
wieku trzeba dożyć, żeby wyjść na zero (bez waloryzacji), i kto statystycznie tego wieku
dożywa. `m_M`, `m_K`, `w_zwrot`, `w_dozycia_M/K` nie zależą od `wal_e`/`i` — liczą się na
samych miesiącach z tablic.

## 8. Schemat przepływu

```mermaid
flowchart TD
    A[Wejście: prognoza E, wiek w] --> B[Przycięcie do zakresów<br/>E 1 000-20 000 zł, w 60-80 lat]
    B --> C[Krok 0: odczyt tablic dla wieku w<br/>e_U unisex, e_M mężczyźni, e_K kobiety]
    C --> C1[Krok 1: realna waloryzacja emerytur<br/>wal_e_real, q_e miesięcznie]
    C --> D[Krok 2: kapitał K = E × e_U<br/>odwrócenie wzoru ZUS]
    D --> E[Krok 3: E_M = K / e_M<br/>tablica męska]
    E --> G[Krok 4: różnica miesięczna d_M]
    G --> H[Krok 5: D_para = suma(e_K) − suma(e_M)<br/>transfer za cały okres emerytury]
    C1 --> H
    H --> I{wiek poniżej 65 lat?}
    I -- tak --> I1[Ostrzeżenie: dla mężczyzny to wiek hipotetyczny<br/>kolumna pokazuje sam efekt tablicy]
    I -- nie --> J
    I1 --> J[Krok 6: miary względne, wiek zwrotu kapitału]
    J --> K[Prezentacja: mężczyzna dostaje E, gdyby uwzględnić czas życia — E_M;<br/>łącznie przez całą emeryturę o D_para mniej niż kobieta]
```

## 9. Walidacje i przypadki brzegowe

| Warunek                            | Zachowanie                                                                                                                                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| wejście poza zakresem              | wartość przycinana do najbliższej granicy (bez komunikatów błędów): `E` do 1 000 – 20 000 zł, `w` do 60 – 80 lat                                                                                                |
| `w < WIEK_EMERYTALNY_M`            | ostrzeżenie `MALE_AGE_HYPOTHETICAL` — mężczyzna nie przejdzie w tym wieku na emeryturę powszechną; wynik pokazuje sam efekt tablicy, nie realny scenariusz                                                      |
| `wal_e < i`                        | **waloryzacja nie może być niższa od inflacji** (gwarancja ustawowa emerytur) — nominalną waloryzację podnosimy do `i`, więc `wal_e_real ≥ 0` i `q_e ≥ 0` (jak `wal_s`/`wal_e` w IKE-ALGORYTM)                  |
| `q_e = 0`                          | wzór graniczny z kroku 5 (`suma(e) = E × e`, bez dzielenia przez zero) — model wraca do dawnej, płaskiej różnicy `E × (e_K − e_M)`                                                                              |
| brak wiersza tablicy dla `w`       | nie może wystąpić: tablice wczytujemy dla pełnego zakresu `WIEK_RANGE`, kompletności pilnuje test danych                                                                                                        |
| `e_M ≥ e_U` lub `e_K ≤ e_U`        | dane z różnych roczników albo błąd transkrypcji; wzory dalej liczą (wynik zmienia znak), a wyłapuje to test niezmiennika z kroku 0 — bez osobnej gałęzi w kalkulatorze                                          |
| `E` bardzo wysokie / bardzo niskie | brak przypadku szczególnego: wszystkie wyniki są liniowe w `E`, więc procent (`u_M_mies`) i liczby miesięcy (`m_M`, `m_K`) w ogóle od `E` nie zależą                                                            |
| zaokrąglenia                       | tablice trzymamy w oryginalnej precyzji (unisex 0,1 miesiąca, GUS 0,01 roku); świadczenie `E_M` prezentujemy z groszami, `D_para` — do pełnych złotych; `wal_e_real`/`q_e` liczymy bez pośredniego zaokrąglania |
| nieaktualne tablice                | rocznik `TABLICE_ROCZNIK` pokazujemy przy wynikach; podmiana tablic to zmiana danych, nie algorytmu                                                                                                             |

## 10. Przykład liczbowy (prognoza 4 500 zł, wiek 65 lat – założenia domyślne)

Wynik w jednym zdaniu: mężczyzna dostaje z ZUS **4 500 zł** miesięcznie, a gdyby ZUS
uwzględnił jego czas życia i policzył emeryturę tablicą męską, wyszłoby **5 061,36 zł**.
W ciągu całego okresu emerytury, w dzisiejszych złotówkach i z uwzględnieniem realnej
waloryzacji emerytur (ok. 1,46% rocznie), mężczyzna dostanie łącznie o **280 293 zł** mniej
niż jego rówieśniczka na tych samych warunkach. Przy 65 latach nie pojawia się ostrzeżenie
`MALE_AGE_HYPOTHETICAL` — to realny, ustawowy wiek emerytalny mężczyzny.

Wynik zależy od wybranego wieku — im później ktoś przechodzi na emeryturę, tym mniejsza
łączna różnica (`D_para`), bo maleje zarówno liczba miesięcy pobierania świadczenia, jak
i rozjazd `e_K − e_M` między tablicami:

| Wiek `w` | `E_M` (miesięcznie) | `D_para` (cały okres emerytury) |
| -------: | ------------------: | ------------------------------: |
|       60 |         5 031,81 zł |                      348 904 zł |
|       65 |         5 061,36 zł |                      280 293 zł |
|       70 |         5 069,24 zł |                      210 523 zł |
|       75 |         5 055,90 zł |                      148 344 zł |
|       80 |         5 031,53 zł |                       98 646 zł |

Pełne przeliczenie krok po kroku (wraz z wariantem dla wieku 60 lat — jedynego, dla którego
`w` jest jednocześnie realnym, ustawowym wiekiem emerytalnym kobiety) w
[CZAS-ZYCIA-PRZYKLAD.md](CZAS-ZYCIA-PRZYKLAD.md).

## 11. Do uzupełnienia przy implementacji

1. **Współdzielić wzór na realną stopę (Fishera)** między `calculator.ts` (IKE) a tym
   kalkulatorem — `wal_e_real = (1 + wal_e) / (1 + i) − 1` to dokładnie ten sam wzór co dla
   `wal_s_real`/`wal_e_real` w IKE-ALGORYTM (§ 6, krok 0 tam / krok 1 tu); rozważyć wspólny
   helper zamiast duplikować.
2. **Zweryfikować rocznik** tablicy unisex wprost w „Wyjaśnieniach do tablicy średniego
   dalszego trwania życia" GUS — musi być ten sam rok umieralności co tablice dla płci (§ 4).
   Obecne dane są sparowane na podstawie znanej metodologii GUS (komunikat unisex publikowany
   w marcu roku N liczony jest z danych za rok N−1, tak samo jak „Trwanie życia w [N−1] r.")
   i potwierdzone zgodnością z wcześniej znanymi wartościami (268,9 / 222,7 / 220,8), ale bez
   wprost zacytowanego zdania ze źródła.
