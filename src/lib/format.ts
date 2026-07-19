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
