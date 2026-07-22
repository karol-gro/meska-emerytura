<script lang="ts">
	import { slide } from 'svelte/transition';
	import * as Card from '$lib/components/ui/card';
	import AssumptionSlider from './AssumptionSlider.svelte';
	import type { CalculatorState } from '$lib/state/calculator.svelte';
	import { INPUT_RANGES } from '$lib/services/constants';

	let { state: calc }: { state: CalculatorState } = $props();

	let open = $state(false);
</script>

<Card.Root>
	<button
		type="button"
		class="flex cursor-pointer items-center justify-between gap-4 px-(--card-spacing) text-left"
		aria-expanded={open}
		aria-controls="assumptions-content"
		onclick={() => (open = !open)}
	>
		<div class="grid gap-1">
			<Card.Title class="label-caps">Założenia</Card.Title>
			<Card.Description
				>Możesz zostawić wartości domyślne albo dopasować je do siebie.</Card.Description
			>
		</div>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="size-5 shrink-0 text-muted-foreground transition-transform duration-250 {open
				? 'rotate-180'
				: ''}"
			aria-hidden="true"
		>
			<path d="m6 9 6 6 6-6" />
		</svg>
	</button>
	{#if open}
		<div id="assumptions-content" transition:slide={{ duration: 250 }}>
			<Card.Content class="grid gap-6">
				<AssumptionSlider
					label="Stopa zastąpienia"
					description="Docelowa emerytura jako % pensji netto"
					value={calc.inputs.replacementRate}
					min={INPUT_RANGES.replacementRate.min}
					max={INPUT_RANGES.replacementRate.max}
					step={1}
					digits={0}
					onchange={(v) => (calc.inputs.replacementRate = v)}
				/>
				<AssumptionSlider
					label="Stopa zwrotu – faza oszczędzania"
					description="Nominalna, rocznie; portfel akcyjno-obligacyjny do 60. r.ż."
					value={calc.inputs.returnAccum}
					min={INPUT_RANGES.returnAccum.min}
					max={INPUT_RANGES.returnAccum.max}
					onchange={(v) => (calc.inputs.returnAccum = v)}
				/>
				<AssumptionSlider
					label="Stopa zwrotu – faza wypłat (60–65)"
					description="Nominalna, rocznie; bezpieczne aktywa"
					value={calc.inputs.returnPayout}
					min={INPUT_RANGES.returnPayout.min}
					max={INPUT_RANGES.returnPayout.max}
					onchange={(v) => (calc.inputs.returnPayout = v)}
				/>
				<AssumptionSlider
					label="Inflacja roczna"
					description="Cel inflacyjny NBP: 2,5%"
					value={calc.inputs.inflation}
					min={INPUT_RANGES.inflation.min}
					max={INPUT_RANGES.inflation.max}
					onchange={(v) => (calc.inputs.inflation = v)}
				/>
				<AssumptionSlider
					label="Waloryzacja składek"
					description="Nominalna, rocznie. Nie mniej niż inflacja."
					value={calc.inputs.contributionValorization}
					min={Math.max(INPUT_RANGES.contributionValorization.min, calc.sanitized.inflation)}
					max={INPUT_RANGES.contributionValorization.max}
					onchange={(v) => (calc.inputs.contributionValorization = v)}
				/>
				<AssumptionSlider
					label="Waloryzacja emerytur"
					description="Nominalna, rocznie. Nie mniej niż inflacja."
					value={calc.inputs.pensionValorization}
					min={Math.max(INPUT_RANGES.pensionValorization.min, calc.sanitized.inflation)}
					max={INPUT_RANGES.pensionValorization.max}
					onchange={(v) => (calc.inputs.pensionValorization = v)}
				/>
				<AssumptionSlider
					label="Obniżka z tytułu dłuższego dożycia"
					description="O ile niższa jest emerytura w wieku 60 niż 65 lat (dłuższe dalsze trwanie życia)"
					value={calc.inputs.lifeExpectancyReduction}
					min={INPUT_RANGES.lifeExpectancyReduction.min}
					max={INPUT_RANGES.lifeExpectancyReduction.max}
					step={1}
					digits={0}
					onchange={(v) => (calc.inputs.lifeExpectancyReduction = v)}
				/>
			</Card.Content>
		</div>
	{/if}
</Card.Root>
