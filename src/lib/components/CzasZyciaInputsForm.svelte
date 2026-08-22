<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import type { CzasZyciaState } from '$lib/state/czas-zycia.svelte';
	import { AGE_RANGE, PENSION_RANGE } from '$lib/services/czas-zycia';
	import { yearWord } from '$lib/format';

	let { state }: { state: CzasZyciaState } = $props();

	function toNumber(raw: string): number {
		const value = Number(raw.replace(',', '.'));
		return Number.isFinite(value) ? value : NaN;
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="label-caps">Twoje dane</Card.Title>
	</Card.Header>
	<Card.Content class="grid gap-6">
		<div class="grid gap-2">
			<Label for="monthly-pension">Prognozowana emerytura miesięczna (zł)</Label>
			<Input
				id="monthly-pension"
				type="number"
				inputmode="decimal"
				min={PENSION_RANGE.min}
				max={PENSION_RANGE.max}
				step="100"
				value={state.inputs.monthlyPension}
				oninput={(e) => (state.inputs.monthlyPension = toNumber(e.currentTarget.value))}
				onchange={() => state.commit()}
			/>
			<p class="text-sm text-muted-foreground">Brutto, tak jak podaje ją kalkulator w eZUS.</p>
		</div>
		<div class="grid gap-2">
			<div class="flex items-baseline justify-between gap-2">
				<Label>Wiek przejścia na emeryturę</Label>
				<span class="text-sm font-medium tabular-nums">
					{state.inputs.age}
					{yearWord(state.inputs.age)}
				</span>
			</div>
			<Slider
				type="single"
				value={state.inputs.age}
				min={AGE_RANGE.min}
				max={AGE_RANGE.max}
				step={1}
				onValueChange={(v: number) => {
					state.inputs.age = v;
					state.commit();
				}}
			/>
			<p class="text-sm text-muted-foreground">
				Domyślnie 65 lat – ustawowy wiek emerytalny mężczyzny; 60 lat to wiek ustawowy kobiety.
			</p>
		</div>
	</Card.Content>
</Card.Root>
