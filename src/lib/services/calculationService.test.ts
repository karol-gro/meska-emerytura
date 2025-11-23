import { describe, it, expect, vi, beforeAll } from 'vitest';
import { CalculationService } from './calculationService';
import type { SimpleCalculationParams } from '../types/CalculationParams';

describe('CalculationService', () => {
	beforeAll(() => {
		const fixed = new Date('2025-08-11T12:34:56Z');
		vi.useFakeTimers();           
		vi.setSystemTime(fixed);
	});

	it('should calculate months to retirement correctly, when birthday is before today', () => {
		const params : SimpleCalculationParams =
		{
			birthYear: 1985,
			birthMonth: 6,
			expectedNetRetirementIncome: 3000
		};
		const service = new CalculationService();

		const results = service.doSimpleCalculation(params);

		// Birth: June 1985
		// Retirement: June 2045 (60 years)
		// Current: August 2025
		// Months to retirement: 20 years (240 months) - 2 months = 238 months
		expect(results.numberOfMonthsToRetirement).toBe(238);
	});

	it('should calculate months to retirement correctly, when birthday is after today', () => {
		const params : SimpleCalculationParams =
		{
			birthYear: 1985,
			birthMonth: 11,
			expectedNetRetirementIncome: 3000
		};
		const service = new CalculationService();

		const results = service.doSimpleCalculation(params);

		// Birth: November 1985
		// Retirement: November 2045 (60 years)
		// Current: August 2025
		// Months to retirement: 20 years (240 months) + 3 months = 243 months
		expect(results.numberOfMonthsToRetirement).toBe(243);
	});

	it('should calculate required capital and savings correctly', () => {
		const params :SimpleCalculationParams =
		{
			birthYear: 1985,
			birthMonth: 6,
			expectedNetRetirementIncome: 3000
		};

		const service = new CalculationService();
		const results = service.doSimpleCalculation(params);

		expect(results.requiredCapital).toBeCloseTo(163440.20);
		expect(results.requiredMonthlySavings).toBeCloseTo(402.92);
	});
});
