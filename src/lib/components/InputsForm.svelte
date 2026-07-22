<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { CalculatorState } from '$lib/state/calculator.svelte';
	import { AGE_RANGE, ageInMonths } from '$lib/services/constants';
	import { yearWord } from '$lib/format';

	let { state }: { state: CalculatorState } = $props();

	const MONTHS = [
		'styczeń',
		'luty',
		'marzec',
		'kwiecień',
		'maj',
		'czerwiec',
		'lipiec',
		'sierpień',
		'wrzesień',
		'październik',
		'listopad',
		'grudzień'
	];

	const minBirthYear = $derived(state.now.year - AGE_RANGE.max);
	const maxBirthYear = $derived(state.now.year - AGE_RANGE.min);

	// wiek liczymy z przyciętych wejść – w trakcie pisania pole może być chwilowo puste
	const age = $derived.by(() => {
		const months = ageInMonths(state.sanitized, state.now);
		return { years: Math.floor(months / 12), months: months % 12 };
	});

	function toNumber(raw: string): number {
		const value = Number(raw.replace(',', '.'));
		return Number.isFinite(value) ? value : NaN;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="label-caps">Twoje dane</Card.Title>
	</Card.Header>
	<Card.Content class="grid gap-4 sm:grid-cols-2">
		<div class="grid gap-2">
			<Label for="birth-year">Data urodzenia</Label>
			<div class="grid grid-cols-[1fr_1.4fr] gap-2">
				<Input
					id="birth-year"
					type="number"
					inputmode="numeric"
					aria-label="Rok urodzenia"
					min={minBirthYear}
					max={maxBirthYear}
					value={state.inputs.birthYear}
					oninput={(e) => (state.inputs.birthYear = toNumber(e.currentTarget.value))}
					onchange={() => state.commit()}
				/>
				<select
					id="birth-month"
					aria-label="Miesiąc urodzenia"
					class="h-10 w-full min-w-0 rounded-lg border-2 border-input bg-transparent px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
					value={state.inputs.birthMonth}
					onchange={(e) => (state.inputs.birthMonth = Number(e.currentTarget.value))}
				>
					{#each MONTHS as month, index (month)}
						<option value={index + 1}>{month}</option>
					{/each}
				</select>
			</div>
			<p class="text-sm text-muted-foreground">
				Wiek: {age.years} {yearWord(age.years)}{age.months > 0 ? ` i ${age.months} mies.` : ''}
			</p>
		</div>
		<div class="grid gap-2">
			<Label for="net-salary">Pensja miesięczna netto (zł)</Label>
			<Input
				id="net-salary"
				type="number"
				inputmode="decimal"
				min="1"
				step="100"
				value={state.inputs.netSalary}
				oninput={(e) => (state.inputs.netSalary = toNumber(e.currentTarget.value))}
				onchange={() => state.commit()}
			/>
			<p class="text-sm text-muted-foreground">Kwota „na rękę"</p>
		</div>
	</Card.Content>
</Card.Root>
