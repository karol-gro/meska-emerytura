export interface CalculationParamsBase {
	birthYear: number; // e.g., 1985
	birthMonth: number; // 1-12
}

export interface SimpleCalculationParams extends CalculationParamsBase {
	expectedNetRetirementIncome: number; // in PLN
}

export interface AdvancedCalculationParams extends CalculationParamsBase {
}
