const pln = new Intl.NumberFormat('pl-PL', {
	style: 'currency',
	currency: 'PLN',
	maximumFractionDigits: 0
});

export function formatPln(value: number): string {
	return pln.format(value);
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
