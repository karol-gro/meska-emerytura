import type { Pit0Inputs, Pit0Result, Pit0Warning } from '$lib/models/pit0';
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

/** Zakres suwaka pensji brutto (§8) */
export const GROSS_RANGE: Range = { min: 1_000, max: 60_000 };

export const DEFAULT_PIT0_INPUTS: Pit0Inputs = {
	grossSalary: 8_000,
	contract: 'uop'
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

/** Czy wejścia są poprawne (pensja w zakresie, znana forma umowy) */
export function validatePit0(inputs: Pit0Inputs): boolean {
	return (
		Number.isFinite(inputs.grossSalary) &&
		inputs.grossSalary >= GROSS_RANGE.min &&
		inputs.grossSalary <= GROSS_RANGE.max &&
		(inputs.contract === 'uop' || inputs.contract === 'zlec')
	);
}

/** Przycina pensję do zakresu, a nieznaną formę umowy sprowadza do domyślnej (§8) */
export function clampPit0(inputs: Pit0Inputs): Pit0Inputs {
	const grossSalary = Number.isFinite(inputs.grossSalary)
		? Math.min(GROSS_RANGE.max, Math.max(GROSS_RANGE.min, inputs.grossSalary))
		: DEFAULT_PIT0_INPUTS.grossSalary;
	const contract =
		inputs.contract === 'uop' || inputs.contract === 'zlec'
			? inputs.contract
			: DEFAULT_PIT0_INPUTS.contract;
	return { grossSalary, contract };
}

/**
 * Algorytm z docs/PIT-0-ALGORYTM.md §6. Zakłada wejścia przycięte przez `clampPit0`.
 * Składki i zdrowotna są wspólne dla obu płci – różni je wyłącznie PIT.
 */
export function calculatePit0(inputs: Pit0Inputs): Pit0Result {
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

	// Krok 5: netto miesięczne
	const commonDeductions = socialContributions + healthContribution;
	const netMan = (grossAnnual - commonDeductions - pitMan) / 12;
	const netWoman = (grossAnnual - commonDeductions - pitWoman) / 12;

	// Krok 6: miary nierówności
	const monthlyDifference = netWoman - netMan; // = (pitMan − pitWoman) / 12
	const genderTax = netWoman !== 0 ? monthlyDifference / netWoman : 0;
	const total5Years = monthlyDifference * GAP_MONTHS; // = (pitMan − pitWoman) × 5

	const warnings: Pit0Warning[] = [];
	if (pitMan === 0) warnings.push('NO_DIFFERENCE');

	return {
		grossAnnual,
		socialContributions,
		healthContribution,
		pitMan,
		pitWoman,
		netMan,
		netWoman,
		monthlyDifference,
		genderTax,
		total5Years,
		warnings
	};
}
