import type { AdvancedCalculationParams, SimpleCalculationParams, CalculationParamsBase } from '../types/CalculationParams';
import type { CalculationResults } from '../types/CalculationResults';
import { CalculationDefaults } from '../constants/calculationConstants';
export class CalculationService {
	doSimpleCalculation(params: SimpleCalculationParams): CalculationResults {
		const expectedNetRetirement = params.expectedNetRetirementIncome;
		const monthsToWomanRetirement = this.calculateMonthsToWomanRetirement(params);
		
		const requiredCapital = this.findRequiredCapital(expectedNetRetirement);
		const requiredMonthlySavings = this.findRequiredMonthlySavings(requiredCapital, monthsToWomanRetirement);
		
		return {
			expectedNetRetirement,
			numberOfMonthsToRetirement: monthsToWomanRetirement,
			requiredMonthlySavings,
			requiredCapital,
		};
	}

	doAdvancedCalculation(params: AdvancedCalculationParams): CalculationResults {
		throw Error("Not implemented");
	}

	private calculateMonthsToWomanRetirement(params: CalculationParamsBase) {
		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth() + 1; // 1-12

		const retirementYear = params.birthYear + 60;
		const retirementMonth = params.birthMonth;

		const yearsDifference = retirementYear - currentYear;
		const monthsDifference = retirementMonth - currentMonth;
		
		return yearsDifference * 12 + monthsDifference;
	}

	private findRequiredCapital(expectedPayOut: number) {
		const numberOfPayoutMonths = 5 * 12;
		const annualReturnRateDuringPayout = CalculationDefaults.annualReturnRateDuringPayout;

		let aggregator = 0;
		// simulate payout in reverse time
		for (let index = numberOfPayoutMonths; index > 0; index--) {
			aggregator /= (1 + annualReturnRateDuringPayout / 12);
			aggregator += expectedPayOut;
			console.debug(`month ${index} of retirement we should start with ${aggregator} zł`);
		}

		return aggregator;
	}

	private findRequiredMonthlySavings(expectedCapital: number, monthsToSave: number) {
		const annualReturnRateDuringAggregation = CalculationDefaults.annualReturnRateDuringAggregation;
		
		// simulate paying 1 zł each month to see how much we gather
		let aggregator = 0;
		for (let index = 1; index <= monthsToSave; index++) {
			aggregator *= (1 + annualReturnRateDuringAggregation / 12);
			aggregator += 1;
			console.debug(`At the end of month ${index} of aggregation we will have ${aggregator}x times the monthly payment`);
		}

		return expectedCapital / aggregator;
	}
}
