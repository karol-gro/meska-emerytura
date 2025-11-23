export class CalculationConstants {
	// Predicted lifespan by age
	static readonly PREDICTED_LIFESPAN: Record<number, number> = {
		// Add age: lifespan mappings here
	};

	// Predicted retirement increases (annual percentage)
	static readonly RETIREMENT_INCREASE_RATE = 0.0;
}

export const CalculationDefaults = {
	annualReturnRateDuringPayout: 0.04,
	annualReturnRateDuringAggregation: 0.05,
};
