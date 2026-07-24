<script lang="ts">
	import AssumptionSlider from '$lib/components/AssumptionSlider.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { Pit0State } from '$lib/state/pit0.svelte';
	import { DEFAULT_RYCZALT_RATE, GROSS_RANGE, RYCZALT_RANGE } from '$lib/services/pit0';

	let { state }: { state: Pit0State } = $props();

	const CONTRACTS = [
		{ value: 'uop', label: 'Umowa o pracę' },
		{ value: 'zlec', label: 'Umowa zlecenie' },
		{ value: 'b2b-ryczalt', label: 'B2B (ryczałt)' }
	] as const;

	const isB2b = $derived(state.inputs.contract === 'b2b-ryczalt');

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
			<Label for="contract">Forma umowy</Label>
			<select
				id="contract"
				aria-label="Forma umowy"
				class="h-10 w-full min-w-0 rounded-lg border-2 border-input bg-transparent px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
				value={state.inputs.contract}
				onchange={(e) => {
					state.inputs.contract = e.currentTarget.value as (typeof CONTRACTS)[number]['value'];
					state.commit();
				}}
			>
				{#each CONTRACTS as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			<p class="invisible text-sm text-muted-foreground">x</p>
		</div>
		<div class="grid gap-2">
			<Label for="gross-salary"
				>{isB2b ? 'Przychód miesięczny (zł)' : 'Pensja miesięczna brutto (zł)'}</Label
			>
			<Input
				id="gross-salary"
				type="number"
				inputmode="decimal"
				min={GROSS_RANGE.min}
				max={GROSS_RANGE.max}
				step="100"
				value={state.inputs.grossSalary}
				oninput={(e) => (state.inputs.grossSalary = toNumber(e.currentTarget.value))}
				onchange={() => state.commit()}
			/>
			<p class="text-sm text-muted-foreground">
				{isB2b ? 'Średni miesięczny przychód bez VAT' : 'Średnia, wraz z premiami'}
			</p>
		</div>
		{#if isB2b}
			<div class="sm:col-span-2">
				<AssumptionSlider
					label="Stawka ryczałtu"
					description="Zależy od rodzaju usług – np. 12% dla IT"
					value={state.inputs.ryczaltRate ?? DEFAULT_RYCZALT_RATE}
					min={RYCZALT_RANGE.min}
					max={RYCZALT_RANGE.max}
					step={0.5}
					digits={1}
					onchange={(rate) => {
						state.inputs.ryczaltRate = rate;
						state.commit();
					}}
				/>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
