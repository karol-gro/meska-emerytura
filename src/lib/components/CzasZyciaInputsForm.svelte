<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { CzasZyciaState } from '$lib/state/czas-zycia.svelte';
	import { PENSION_RANGE } from '$lib/services/czas-zycia';

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
	<Card.Content class="grid gap-2">
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
		<p class="text-sm text-muted-foreground">
			Brutto, tak jak podaje ją kalkulator ZUS / „Twoja przyszła emerytura" w eZUS. Liczymy dla
			wieku 60 lat – jedynego rocznika z kompletem potwierdzonych danych GUS.
		</p>
	</Card.Content>
</Card.Root>
