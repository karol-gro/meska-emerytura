const pln = new Intl.NumberFormat('pl-PL', {
	style: 'currency',
	currency: 'PLN',
	maximumFractionDigits: 0
});

/** Kwota w zł. `digits` > 0 pokazuje grosze (np. netto w kalkulatorze PIT-0). */
export function formatPln(value: number, digits = 0): string {
	if (digits === 0) return pln.format(value);
	return new Intl.NumberFormat('pl-PL', {
		style: 'currency',
		currency: 'PLN',
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(value);
}

export function formatPercent(fraction: number, digits = 1): string {
	return new Intl.NumberFormat('pl-PL', {
		style: 'percent',
		minimumFractionDigits: 0,
		maximumFractionDigits: digits
	}).format(fraction);
}

/** Poprawna forma słowa „rok" dla danej liczby lat (1 rok, 22 lata, 5 lat). */
export function yearWord(years: number): string {
	if (years === 1) return 'rok';
	const lastDigit = years % 10;
	const lastTwo = years % 100;
	if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'lata';
	return 'lat';
}
