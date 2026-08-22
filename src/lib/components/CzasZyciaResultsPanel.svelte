<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { CzasZyciaResult } from '$lib/models/czas-zycia';
	import { formatPln, formatPercent, yearWord } from '$lib/format';
	import { IconGenderMale, IconGenderFemale, IconUsers } from '@tabler/icons-svelte';

	let { result, pension }: { result: CzasZyciaResult; pension: number } = $props();

	/** Wiek dożycia w formacie „81,5 lat" (jedno miejsce po przecinku, jak w tablicach GUS) */
	function formatAge(age: number): string {
		return `${age.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${yearWord(Math.round(age))}`;
	}
</script>

<!-- 1. Ile kto statystycznie dożywa – punkt wyjścia całego porównania -->
<Card.Root>
	<Card.Header>
		<Card.Description class="label-caps">Statystyczny wiek dożycia</Card.Description>
	</Card.Header>
	<Card.Content class="grid gap-4 sm:grid-cols-3">
		<div class="flex items-start gap-3">
			<IconGenderMale class="size-7 shrink-0 text-primary" stroke={2} aria-hidden="true" />
			<div class="grid gap-1">
				<p class="label-caps text-muted-foreground">Mężczyzna</p>
				<p class="data-display text-2xl">{formatAge(result.lifeExpectancyAgeMale)}</p>
			</div>
		</div>
		<div class="flex items-start gap-3">
			<IconUsers class="size-7 shrink-0 text-muted-foreground" stroke={2} aria-hidden="true" />
			<div class="grid gap-1">
				<p class="label-caps text-muted-foreground">Wg tablicy ZUS</p>
				<p class="data-display text-2xl">{formatAge(result.lifeExpectancyAgeUnisex)}</p>
			</div>
		</div>
		<div class="flex items-start gap-3">
			<IconGenderFemale class="size-7 shrink-0 text-destructive" stroke={2} aria-hidden="true" />
			<div class="grid gap-1">
				<p class="label-caps text-muted-foreground">Kobieta</p>
				<p class="data-display text-2xl">{formatAge(result.lifeExpectancyAgeFemale)}</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>

<!-- 2. Emerytura miesięczna: dziś vs po uwzględnieniu czasu życia, i różnica procentowa -->
<div class="grid gap-4 sm:grid-cols-3">
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
		<Card.Content class="text-sm text-muted-foreground">Miesięcznie, brutto</Card.Content>
	</Card.Root>

	<Card.Root class="border-t-2 border-t-primary">
		<Card.Header class="flex items-start gap-3">
			<IconGenderMale class="size-7 shrink-0 text-primary" stroke={2} aria-hidden="true" />
			<div class="grid auto-rows-min gap-1">
				<Card.Description class="label-caps">Gdyby uwzględniono czas życia</Card.Description>
				<Card.Title class="data-display text-4xl">
					{formatPln(result.pensionIfMaleTable, 2)}
				</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="text-sm text-muted-foreground">Miesięcznie, z tablicy męskiej</Card.Content
		>
	</Card.Root>

	<Card.Root class="border-t-2 border-t-destructive">
		<Card.Header class="flex items-start gap-3">
			<div class="grid auto-rows-min gap-1">
				<Card.Description class="label-caps">Różnica</Card.Description>
				<Card.Title class="data-display text-4xl text-destructive">
					{formatPercent(result.monthlyGapShare)}
				</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="text-sm text-muted-foreground">
			O tyle niższą emeryturę dostaje mężczyzna
		</Card.Content>
	</Card.Root>
</div>

<!-- 3. Karta „luki" – akcent Crimson Warning (wizualna manifestacja nierówności) -->
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
