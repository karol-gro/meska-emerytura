<script lang="ts">
	import { slide } from 'svelte/transition';
	import * as Card from '$lib/components/ui/card';
	import AssumptionSlider from './AssumptionSlider.svelte';
	import type { CzasZyciaState } from '$lib/state/czas-zycia.svelte';
	import { INFLATION_RANGE, VALORIZATION_RANGE } from '$lib/services/czas-zycia';

	let { state: calc }: { state: CzasZyciaState } = $props();

	let open = $state(false);
</script>

<Card.Root>
	<button
		type="button"
		class="flex cursor-pointer items-center justify-between gap-4 px-(--card-spacing) text-left"
		aria-expanded={open}
		aria-controls="czas-zycia-assumptions-content"
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
		<div id="czas-zycia-assumptions-content" transition:slide={{ duration: 250 }}>
			<Card.Content class="grid gap-6">
				<AssumptionSlider
					label="Waloryzacja emerytur"
					description="Nominalna, rocznie. Nie mniej niż inflacja. Wpływa tylko na sumę za cały okres emerytury."
					value={calc.inputs.pensionValorization}
					min={Math.max(VALORIZATION_RANGE.min, calc.sanitized.inflation)}
					max={VALORIZATION_RANGE.max}
					onchange={(v) => (calc.inputs.pensionValorization = v)}
				/>
				<AssumptionSlider
					label="Inflacja roczna"
					description="Cel inflacyjny NBP: 2,5%"
					value={calc.inputs.inflation}
					min={INFLATION_RANGE.min}
					max={INFLATION_RANGE.max}
					onchange={(v) => (calc.inputs.inflation = v)}
				/>
			</Card.Content>
		</div>
	{/if}
</Card.Root>
