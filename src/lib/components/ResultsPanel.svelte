<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { CalculationResult } from '$lib/models/results';
	import { formatPln, formatPercent } from '$lib/format';

	let { result }: { result: CalculationResult } = $props();

	// pauza jako placeholder braku wartości, nie znak interpunkcyjny
	const EMPTY_VALUE = '—'; // allow-em-dash
</script>

<!-- Karty „męskie" – akcent Deep Cobalt na górnej krawędzi (DESIGN.md: Comparison Cards) -->
<div class="grid gap-4 sm:grid-cols-2">
	<Card.Root class="border-t-2 border-t-primary">
		<Card.Header>
			<Card.Description class="label-caps">Kapitał na IKE w dniu 60. urodzin</Card.Description>
			<Card.Title class="data-display text-4xl">{formatPln(result.requiredCapital)}</Card.Title>
		</Card.Header>
		<Card.Content class="text-sm text-muted-foreground">
			Pokrywa 5 lat wypłat po {formatPln(result.targetPension)} miesięcznie, zanim ZUS zacznie płacić
			(w wieku 65 lat).
		</Card.Content>
	</Card.Root>

	<Card.Root class="border-t-2 border-t-primary">
		<Card.Header>
			<Card.Description class="label-caps">Miesięczna wpłata od dziś</Card.Description>
			<Card.Title class="data-display text-4xl">
				{result.monthlyContribution === null ? EMPTY_VALUE : formatPln(result.monthlyContribution)}
			</Card.Title>
		</Card.Header>
		<Card.Content class="text-sm text-muted-foreground">
			{#if result.monthlyContribution !== null}
				Przez {result.monthsOfSaving} miesięcy. Kwota realna – indeksuj ją co roku o inflację.
			{:else}
				Brak fazy oszczędzania – ten kapitał musiałbyś mieć już dziś.
			{/if}
		</Card.Content>
	</Card.Root>
</div>

{#if result.monthlyContribution !== null}
	<Card.Root>
		<Card.Content class="grid gap-4 sm:grid-cols-3">
			<div class="grid gap-1">
				<p class="label-caps text-muted-foreground">Udział w pensji</p>
				<p class="data-display text-2xl">{formatPercent(result.salaryShare!)}</p>
				<p class="text-xs text-muted-foreground">tyle pensji pochłania „podatek od płci"</p>
			</div>
			<div class="grid gap-1">
				<p class="label-caps text-muted-foreground">Wpłaty rocznie</p>
				<p class="data-display text-2xl">{formatPln(result.annualContribution!)}</p>
			</div>
			<div class="grid gap-1">
				<p class="label-caps text-muted-foreground">Suma wpłat</p>
				<p class="data-display text-2xl">{formatPln(result.totalContributions!)}</p>
				<p class="text-xs text-muted-foreground">z własnej kieszeni, realnie</p>
			</div>
		</Card.Content>
	</Card.Root>
{/if}

<!-- Karta „luki" – akcent Crimson Warning (DESIGN.md: wizualna manifestacja nierówności) -->
<Card.Root class="border-t-2 border-t-destructive">
	<Card.Content class="flex flex-wrap items-baseline justify-between gap-4">
		<p class="label-caps text-muted-foreground">Kobieta w identycznej sytuacji odkłada</p>
		<p class="data-display text-4xl text-destructive">0 zł</p>
	</Card.Content>
</Card.Root>
