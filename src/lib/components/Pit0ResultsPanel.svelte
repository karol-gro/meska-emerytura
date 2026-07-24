<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Pit0Result } from '$lib/models/pit0';
	import { formatPln, formatPercent } from '$lib/format';
	import { IconGenderMale, IconGenderFemale } from '@tabler/icons-svelte';

	let { result }: { result: Pit0Result } = $props();
</script>

<!-- Porównanie wypłat netto: mężczyzna vs kobieta na identycznym brutto -->
<Card.Root>
	<Card.Content class="grid gap-4 sm:grid-cols-2">
		<div class="flex items-start gap-3">
			<IconGenderMale class="size-7 shrink-0 text-primary" stroke={2} aria-hidden="true" />
			<div class="grid gap-1">
				<p class="label-caps text-muted-foreground">Netto mężczyzny</p>
				<p class="data-display text-2xl">{formatPln(result.netMan, 2)}</p>
				<p class="text-xs text-muted-foreground">miesięcznie, po podatku i składkach</p>
			</div>
		</div>
		<div class="flex items-start gap-3">
			<IconGenderFemale class="size-7 shrink-0 text-destructive" stroke={2} aria-hidden="true" />
			<div class="grid gap-1">
				<p class="label-caps text-muted-foreground">Netto kobiety</p>
				<p class="data-display text-2xl">{formatPln(result.netWoman, 2)}</p>
				<p class="text-xs text-muted-foreground">ta sama pensja brutto, ta sama praca</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>

<!-- Dwa główne wyniki: procentowy „podatek od płci" i łączna strata przez 5 lat -->
<div class="grid gap-4 sm:grid-cols-2">
	<Card.Root class="border-t-2 border-t-primary">
		<Card.Header class="flex items-start gap-3">
			<IconGenderMale class="size-7 shrink-0 text-primary" stroke={2} aria-hidden="true" />
			<div class="grid auto-rows-min gap-1">
				<Card.Description class="label-caps">Podatek od płci</Card.Description>
				<Card.Title class="data-display text-4xl">{formatPercent(result.genderTax)}</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="text-sm text-muted-foreground">
			O tyle mężczyzna ma niższą wypłatę niż kobieta
		</Card.Content>
	</Card.Root>

	<Card.Root class="border-t-2 border-t-primary">
		<Card.Header class="flex items-start gap-3">
			<IconGenderMale class="size-7 shrink-0 text-primary" stroke={2} aria-hidden="true" />
			<div class="grid auto-rows-min gap-1">
				<Card.Description class="label-caps">Łącznie przez 5 lat</Card.Description>
				<Card.Title class="data-display text-4xl">{formatPln(result.total5Years)}</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="text-sm text-muted-foreground">
			Tyle więcej podatku mężczyzna odda fiskusowi przez 5 lat
		</Card.Content>
	</Card.Root>
</div>

<!-- Karta „luki" – akcent Crimson Warning (wizualna manifestacja nierówności) -->
<Card.Root class="border-t-2 border-t-destructive">
	<Card.Content class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<IconGenderFemale class="size-7 shrink-0 text-destructive" stroke={2} aria-hidden="true" />
			<p class="label-caps text-muted-foreground">Kobieta co miesiąc dostaje więcej o</p>
		</div>
		<p class="data-display text-4xl text-destructive">{formatPln(result.monthlyDifference, 2)}</p>
	</Card.Content>
</Card.Root>
