export interface CalculationResults {
	expectedNetRetirement: number;
	numberOfMonthsToRetirement: number; // when you become 60

	requiredCapital: number; // in PLN
	requiredMonthlySavings: number; // in PLN
}
