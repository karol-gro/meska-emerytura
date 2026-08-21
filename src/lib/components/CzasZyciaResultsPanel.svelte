<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { CzasZyciaResult } from '$lib/models/czas-zycia';
	import { formatPln, formatPercent } from '$lib/format';
	import { IconGenderMale, IconGenderFemale } from '@tabler/icons-svelte';

	let { result, pension }: { result: CzasZyciaResult; pension: number } = $props();
</script>

<!-- Dwie strony tej samej osoby: co dostaje dziś (tablica wspólna) vs gdyby ZUS uwzględnił jego czas życia -->
<div class="grid gap-4 sm:grid-cols-2">
	<Card.Root class="border-t-2 border-t-primary">
		<Card.Header class="flex items-start gap-3">
			<IconGenderMale class="size-7 shrink-0 text-primary" stroke={2} aria-hidden="true" />
			<div class="grid auto-rows-min gap-1">
				<Card.Description class="label-caps">Emerytura dziś</Card.Description>
				<Card.Title class="data-display text-4xl">
					{formatPln(pension, 2)}
				</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="text-sm text-muted-foreground">
			Miesięcznie, ze wspólnej (unisex) tablicy ZUS
		</Card.Content>
	</Card.Root>

	<Card.Root class="border-t-2 border-t-primary">
		<Card.Header class="flex items-start gap-3">
			<IconGenderMale class="size-7 shrink-0 text-primary" stroke={2} aria-hidden="true" />
			<div class="grid auto-rows-min gap-1">
				<Card.Description class="label-caps">Gdyby uwzględniono jego czas życia</Card.Description>
				<Card.Title class="data-display text-4xl">
					{formatPln(result.pensionIfMaleTable, 2)}
				</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="text-sm text-muted-foreground">
			Miesięcznie, z tablicy męskiej – o {formatPercent(result.monthlyGapShare)} więcej
		</Card.Content>
	</Card.Root>
</div>

<!-- Wyniki pochodne: wiek zwrotu kapitału vs statystyczne dożycie -->
<Card.Root>
	<Card.Content class="flex items-start gap-3">
		<IconGenderMale class="size-7 shrink-0 text-primary" stroke={2} aria-hidden="true" />
		<div class="grid flex-1 gap-4 sm:grid-cols-2">
			<div class="grid gap-1">
				<p class="label-caps text-muted-foreground">Wiek zwrotu kapitału</p>
				<p class="data-display text-2xl">{result.breakEvenAge.toFixed(1)} lat</p>
				<p class="text-xs text-muted-foreground">
					dopiero wtedy emeryt odbiera cały swój kapitał (bez waloryzacji)
				</p>
			</div>
			<div class="grid gap-1">
				<p class="label-caps text-muted-foreground">Statystyczny wiek dożycia</p>
				<p class="data-display text-2xl">{result.lifeExpectancyAgeMale.toFixed(1)} lat</p>
				<p class="text-xs text-muted-foreground">
					mężczyzna zwykle nie dożywa wieku zwrotu kapitału; kobieta (statystycznie {result.lifeExpectancyAgeFemale.toFixed(
						1
					)} lat) go przekracza
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>

<!-- Karta „luki" – akcent Crimson Warning (wizualna manifestacja nierówności) -->
<Card.Root class="border-t-2 border-t-destructive">
	<Card.Content class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<IconGenderFemale class="size-7 shrink-0 text-destructive" stroke={2} aria-hidden="true" />
			<p class="label-caps text-muted-foreground">
				Łącznie przez całą emeryturę kobieta dostanie więcej o
			</p>
		</div>
		<p class="data-display text-4xl text-destructive">{formatPln(result.lifetimeGap)}</p>
	</Card.Content>
</Card.Root>
