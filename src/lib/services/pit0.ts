import type { ContractType, Pit0Inputs, Pit0Result, Pit0Warning } from '$lib/models/pit0';
import { GAP_MONTHS, type Range } from './constants';

/**
 * Stałe systemowe PIT-0 (docs/PIT-0-ALGORYTM.md §4) – wartości na 2026 r.
 * Aktualizowane co roku; jedyne źródło prawdy dla obliczeń, walidacji i codeca.
 */
export const SKL_EMERYTALNA = 0.0976;
export const SKL_RENTOWA = 0.015;
export const SKL_CHOROBOWA = 0.0245;
export const SKL_ZDROWOTNA = 0.09;
/** Roczne standardowe koszty uzyskania przychodu na UoP: 12 × 250 zł */
export const KUP_UOP_ROCZNE = 3_000;
/** Koszty na zleceniu: 20% przychodu po składkach społecznych */
export const KUP_ZLEC_STOPA = 0.2;
/** Roczny limit przychodu zwolnionego z PIT (ulga dla pracujących seniorów) */
export const LIMIT_ULGI = 85_528;
/** Granica między pierwszym a drugim progiem skali */
export const PROG_SKALI = 120_000;
export const STAWKA_1 = 0.12;
export const STAWKA_2 = 0.32;
/** Kwota zmniejszająca podatek = 12% × 30 000 zł kwoty wolnej */
export const KWOTA_ZMNIEJSZ = 3_600;
/** 30-krotność prognozowanego wynagrodzenia (2026) – roczny limit podstawy składek emerytalnej i rentowej */
export const LIMIT_30KROTNOSC = 282_600;

// --- B2B na ryczałcie od przychodów ewidencjonowanych (wartości 2026) ---
/** Prognozowane przeciętne wynagrodzenie miesięczne 2026 (= LIMIT_30KROTNOSC / 30) */
export const PROGN_WYNAGRODZENIE = LIMIT_30KROTNOSC / 30;
/** Podstawa „dużego ZUS": 60% prognozowanego przeciętnego wynagrodzenia = 5 652 zł/mies. */
export const B2B_ZUS_BASE = 0.6 * PROGN_WYNAGRODZENIE;
/** Składki społeczne przedsiębiorcy (część własna, pełne stawki) */
export const SKL_EMERYT_B2B = 0.1952;
export const SKL_RENT_B2B = 0.08;
export const SKL_WYPADK_B2B = 0.0167;
/** Przeciętne wynagrodzenie w sektorze przedsiębiorstw (IV kw. 2025) – podstawa zdrowotnej ryczałtowca */
export const B2B_ZDROW_BASE = 9_228.64;
/** Progi rocznego przychodu wyznaczające mnożnik podstawy zdrowotnej (60% / 100% / 180%) */
export const B2B_ZDROW_PROG_NISKI = 60_000;
export const B2B_ZDROW_PROG_WYSOKI = 300_000;
/** Część zapłaconej składki zdrowotnej odliczana od przychodu w ryczałcie */
export const B2B_ZDROW_ODLICZENIE = 0.5;
/** Zakres i domyślna wartość suwaka stawki ryczałtu (§8) */
export const RYCZALT_RANGE: Range = { min: 0.02, max: 0.17 };
export const DEFAULT_RYCZALT_RATE = 0.12;

/** Zakres suwaka pensji brutto (§8) */
export const GROSS_RANGE: Range = { min: 1_000, max: 60_000 };

export const DEFAULT_PIT0_INPUTS: Pit0Inputs = {
	grossSalary: 8_000,
	contract: 'uop',
	ryczaltRate: DEFAULT_RYCZALT_RATE
};

/**
 * Roczne składki społeczne pracownika/zleceniobiorcy z limitem 30-krotności (§ krok 1).
 * Emerytalna i rentowa liczone od podstawy przyciętej do rocznego limitu (powyżej niego nie są
 * pobierane); chorobowa (tylko UoP, założenie §3) bez limitu. Identyczne dla obu płci.
 * Dla `grossAnnual ≤ LIMIT_30KROTNOSC` równa się dawnej stopie łącznej (UoP 13,71%, zlecenie 11,26%).
 */
function socialContributionsFor(contract: Pit0Inputs['contract'], grossAnnual: number): number {
	const retirementDisabilityBase = Math.min(grossAnnual, LIMIT_30KROTNOSC);
	const retirementDisability = (SKL_EMERYTALNA + SKL_RENTOWA) * retirementDisabilityBase;
	const sickness = contract === 'uop' ? SKL_CHOROBOWA * grossAnnual : 0;
	return retirementDisability + sickness;
}

/**
 * Podatek wg skali (§ krok 2). Podstawę i podatek zaokrąglamy do pełnych złotych
 * (jak w zeznaniu rocznym); kwota zmniejszająca to wbudowana kwota wolna 30 000 zł.
 */
export function pitByScale(taxBase: number): number {
	const p = Math.round(taxBase);
	const t =
		STAWKA_1 * Math.min(p, PROG_SKALI) + STAWKA_2 * Math.max(0, p - PROG_SKALI) - KWOTA_ZMNIEJSZ;
	return Math.round(Math.max(t, 0));
}

const CONTRACTS: readonly ContractType[] = ['uop', 'zlec', 'b2b-ryczalt'];

/** Stawka ryczałtu przycięta do dozwolonego zakresu; brak wartości → stawka domyślna. */
function clampRyczaltRate(rate: number | undefined): number {
	return Number.isFinite(rate)
		? Math.min(RYCZALT_RANGE.max, Math.max(RYCZALT_RANGE.min, rate as number))
		: DEFAULT_RYCZALT_RATE;
}

/** Czy wejścia są poprawne (pensja w zakresie, znana forma umowy, stawka ryczałtu w zakresie) */
export function validatePit0(inputs: Pit0Inputs): boolean {
	const rateOk =
		inputs.ryczaltRate === undefined ||
		(Number.isFinite(inputs.ryczaltRate) &&
			inputs.ryczaltRate >= RYCZALT_RANGE.min &&
			inputs.ryczaltRate <= RYCZALT_RANGE.max);
	return (
		Number.isFinite(inputs.grossSalary) &&
		inputs.grossSalary >= GROSS_RANGE.min &&
		inputs.grossSalary <= GROSS_RANGE.max &&
		CONTRACTS.includes(inputs.contract) &&
		rateOk
	);
}

/** Przycina pensję i stawkę do zakresów, a nieznaną formę umowy sprowadza do domyślnej (§8) */
export function clampPit0(inputs: Pit0Inputs): Pit0Inputs {
	const grossSalary = Number.isFinite(inputs.grossSalary)
		? Math.min(GROSS_RANGE.max, Math.max(GROSS_RANGE.min, inputs.grossSalary))
		: DEFAULT_PIT0_INPUTS.grossSalary;
	const contract = CONTRACTS.includes(inputs.contract)
		? inputs.contract
		: DEFAULT_PIT0_INPUTS.contract;
	return { grossSalary, contract, ryczaltRate: clampRyczaltRate(inputs.ryczaltRate) };
}

/**
 * Kroki 5–6 wspólne dla wszystkich form (docs/PIT-0-ALGORYTM.md §6): netto miesięczne, miary
 * nierówności i ostrzeżenia. Składki (`socialContributions` + `healthContribution`) i podatki
 * (`taxMan`, `taxWoman`) przekazuje wyliczona wcześniej gałąź; różnicę robi wyłącznie podatek.
 */
function assembleResult(
	grossAnnual: number,
	socialContributions: number,
	healthContribution: number,
	taxMan: number,
	taxWoman: number
): Pit0Result {
	const commonDeductions = socialContributions + healthContribution;
	const netMan = (grossAnnual - commonDeductions - taxMan) / 12;
	const netWoman = (grossAnnual - commonDeductions - taxWoman) / 12;

	const monthlyDifference = netWoman - netMan; // = (taxMan − taxWoman) / 12
	const genderTax = netWoman !== 0 ? monthlyDifference / netWoman : 0;
	const total5Years = monthlyDifference * GAP_MONTHS; // = (taxMan − taxWoman) × 5

	const warnings: Pit0Warning[] = [];
	if (taxMan === 0) warnings.push('NO_DIFFERENCE');

	return {
		grossAnnual,
		socialContributions,
		healthContribution,
		pitMan: taxMan,
		pitWoman: taxWoman,
		netMan,
		netWoman,
		monthlyDifference,
		genderTax,
		total5Years,
		warnings
	};
}

/** Miesięczna podstawa składki zdrowotnej ryczałtowca wg progu rocznego przychodu (§6 B2B). */
function b2bHealthBase(grossAnnual: number): number {
	if (grossAnnual <= B2B_ZDROW_PROG_NISKI) return 0.6 * B2B_ZDROW_BASE;
	if (grossAnnual <= B2B_ZDROW_PROG_WYSOKI) return B2B_ZDROW_BASE;
	return 1.8 * B2B_ZDROW_BASE;
}

/**
 * B2B na ryczałcie od przychodów ewidencjonowanych (docs/PIT-0-ALGORYTM.md §6 B2B).
 * Składki społeczne to stały „duży ZUS" (niezależny od przychodu), zdrowotna jest progowa –
 * oba identyczne dla obu płci. Podatek to ryczałt od przychodu po odliczeniu składek społecznych
 * i połowy zdrowotnej; ulga PIT-0 zwalnia przychód do limitu (bez kwoty wolnej – ryczałt jej nie ma).
 */
function calculateB2bRyczalt(inputs: Pit0Inputs): Pit0Result {
	const rate = clampRyczaltRate(inputs.ryczaltRate);
	const grossAnnual = 12 * inputs.grossSalary;

	// Składki – niezależne od płci; społeczne od stałej podstawy, zdrowotna wg progu przychodu
	const socialContributions = (SKL_EMERYT_B2B + SKL_RENT_B2B + SKL_WYPADK_B2B) * 12 * B2B_ZUS_BASE;
	const healthContribution = SKL_ZDROWOTNA * 12 * b2bHealthBase(grossAnnual);
	// Ryczałt liczy się od przychodu po odliczeniu składek społecznych i połowy zdrowotnej
	const deductions = socialContributions + B2B_ZDROW_ODLICZENIE * healthContribution;

	// Mężczyzna: ryczałt od całego przychodu po odliczeniach
	const ryczaltMan = Math.round(rate * Math.max(0, grossAnnual - deductions));

	// Kobieta: przychód do limitu zwolniony; odliczenia tylko w części opodatkowanej (§ D5)
	const exemptRevenue = Math.min(grossAnnual, LIMIT_ULGI);
	const taxedRevenue = grossAnnual - exemptRevenue;
	const taxedShare = grossAnnual > 0 ? taxedRevenue / grossAnnual : 0;
	const ryczaltWoman = Math.round(rate * Math.max(0, taxedRevenue - deductions * taxedShare));

	return assembleResult(
		grossAnnual,
		socialContributions,
		healthContribution,
		ryczaltMan,
		ryczaltWoman
	);
}

/**
 * Algorytm z docs/PIT-0-ALGORYTM.md §6. Zakłada wejścia przycięte przez `clampPit0`.
 * Składki i zdrowotna są wspólne dla obu płci – różni je wyłącznie podatek.
 */
export function calculatePit0(inputs: Pit0Inputs): Pit0Result {
	if (inputs.contract === 'b2b-ryczalt') return calculateB2bRyczalt(inputs);

	// UoP / zlecenie – opodatkowanie skalą.
	// Krok 0–1: rocznienie, składki społeczne (z limitem 30-krotności) i zdrowotna – identyczne dla M i K
	const grossAnnual = 12 * inputs.grossSalary;
	const socialContributions = socialContributionsFor(inputs.contract, grossAnnual);
	const healthContribution = SKL_ZDROWOTNA * (grossAnnual - socialContributions);

	// Krok 3: podatek mężczyzny (bez ulgi)
	const kupMan =
		inputs.contract === 'uop'
			? KUP_UOP_ROCZNE
			: KUP_ZLEC_STOPA * (grossAnnual - socialContributions);
	const incomeMan = grossAnnual - socialContributions - kupMan;
	const pitMan = pitByScale(incomeMan);

	// Krok 4: podatek kobiety (ulga PIT-0). Przychód dzielimy na zwolniony i opodatkowany;
	// składki społeczne odliczamy tylko w części przypadającej na przychód opodatkowany (§ D5).
	const exemptRevenue = Math.min(grossAnnual, LIMIT_ULGI);
	const taxedRevenue = grossAnnual - exemptRevenue;
	const taxedShare = grossAnnual > 0 ? taxedRevenue / grossAnnual : 0;
	const deductibleSocial = socialContributions * taxedShare;
	const kupWoman =
		inputs.contract === 'uop'
			? Math.min(KUP_UOP_ROCZNE, taxedRevenue)
			: KUP_ZLEC_STOPA * (taxedRevenue - deductibleSocial);
	const incomeWoman = taxedRevenue - deductibleSocial - kupWoman;
	const pitWoman = pitByScale(incomeWoman);

	return assembleResult(grossAnnual, socialContributions, healthContribution, pitMan, pitWoman);
}
