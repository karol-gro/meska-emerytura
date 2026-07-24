<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { CalculationResult } from '$lib/models/results';
	import { formatPln, formatPercent } from '$lib/format';
	import { IconGenderMale, IconGenderFemale } from '@tabler/icons-svelte';

	let { result }: { result: CalculationResult } = $props();
</script>

<!-- Karty „męskie" – akcent Deep Cobalt na górnej krawędzi (DESIGN.md: Comparison Cards) -->
<!-- Dwa główne wyniki: ile miesięcznie odkładać i ile łącznie trzeba odłożyć -->
<div class="grid gap-4 sm:grid-cols-2">
	<Card.Root class="border-t-2 border-t-primary">
		<Card.Header class="flex items-start gap-3">
			<IconGenderMale class="size-7 shrink-0 text-primary" stroke={2} aria-hidden="true" />
			<div class="grid auto-rows-min gap-1">
				<Card.Description class="label-caps">Miesięczna wpłata na IKE</Card.Description>
				<Card.Title class="data-display text-4xl">
					{formatPln(result.monthlyContribution)}
				</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="text-sm text-muted-foreground">
			Przez {result.monthsOfSaving} miesięcy
		</Card.Content>
	</Card.Root>

	<Card.Root class="border-t-2 border-t-primary">
		<Card.Header class="flex items-start gap-3">
			<IconGenderMale class="size-7 shrink-0 text-primary" stroke={2} aria-hidden="true" />
			<div class="grid auto-rows-min gap-1">
				<Card.Description class="label-caps">Suma wpłat</Card.Description>
				<Card.Title class="data-display text-4xl">
					{formatPln(result.totalContributions)}
				</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="text-sm text-muted-foreground">
			Tyle łącznie mężczyzna wyda z własnej kieszeni
		</Card.Content>
	</Card.Root>
</div>

<!-- Wyniki pochodne: udział w pensji i docelowy kapitał na IKE -->
<Card.Root>
	<Card.Content class="flex items-start gap-3">
		<IconGenderMale class="size-7 shrink-0 text-primary" stroke={2} aria-hidden="true" />
		<div class="grid flex-1 gap-4 sm:grid-cols-2">
			<div class="grid gap-1">
				<p class="label-caps text-muted-foreground">Udział w pensji</p>
				<p class="data-display text-2xl">{formatPercent(result.salaryShare)}</p>
				<p class="text-xs text-muted-foreground">tyle pensji pochłania „podatek od płci"</p>
			</div>
			<div class="grid gap-1">
				<p class="label-caps text-muted-foreground">Kapitał na IKE w dniu 60. urodzin</p>
				<p class="data-display text-2xl">{formatPln(result.requiredCapital)}</p>
				<p class="text-xs text-muted-foreground">
					pokrywa 5 lat wypłat po {formatPln(result.replacementBenefit)} miesięcznie – tyle średnio dostaje
					w tym czasie kobieta
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>

<!-- Karta „luki" – akcent Crimson Warning (DESIGN.md: wizualna manifestacja nierówności) -->
<Card.Root class="border-t-2 border-t-destructive">
	<Card.Content class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<IconGenderFemale class="size-7 shrink-0 text-destructive" stroke={2} aria-hidden="true" />
			<p class="label-caps text-muted-foreground">Kobieta w identycznej sytuacji odkłada</p>
		</div>
		<p class="data-display text-4xl text-destructive">0 zł</p>
	</Card.Content>
</Card.Root>
