<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import Pit0InputsForm from '$lib/components/Pit0InputsForm.svelte';
	import Pit0ResultsPanel from '$lib/components/Pit0ResultsPanel.svelte';
	import Pit0WarningsList from '$lib/components/Pit0WarningsList.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Pit0State } from '$lib/state/pit0.svelte';
	import { formatPln } from '$lib/format';

	const calc = new Pit0State(page.url);

	// wyniki od razu, gdy ktoś wszedł z udostępnionego linka; inaczej czekamy na „Policz"
	let showResults = $state(calc.startedFromLink);
	let resultsSection = $state<HTMLElement>();

	async function scrollToResults() {
		await tick();
		requestAnimationFrame(() => {
			resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	}

	async function reveal() {
		showResults = true;
		await scrollToResults();
	}

	onMount(() => {
		if (calc.startedFromLink) {
			calc.stripShareParam();
			scrollToResults();
		}
	});
</script>

<header class="grid gap-3">
	<p class="text-lg text-muted-foreground">
		Kobieta, która po 60. urodzinach dalej pracuje i nie pobiera emerytury, korzysta z ulgi PIT-0
		dla seniora. Mężczyzna płaci PIT normalnie, bo prawo do ulgi nabywa dopiero w wieku 65 lat.
	</p>
	<p class="text-lg text-muted-foreground">
		Policz, o ile niższą wypłatę dostaje mężczyzna i ile łącznie dopłaca w latach 60–65.
	</p>
</header>

<Pit0InputsForm state={calc} />

{#if showResults}
	<section bind:this={resultsSection} class="grid scroll-mt-6 gap-8">
		<Pit0WarningsList warnings={calc.result.warnings} />
		<Pit0ResultsPanel result={calc.result} />
		<div class="flex justify-end">
			<ShareButton
				url={calc.shareUrl}
				shareText={`Mój „podatek od płci" to ${formatPln(calc.result.monthlyDifference, 2)} miesięcznie – tyle mniej mam na rękę niż kobieta, bo ulgę PIT-0 dostanę dopiero 5 lat później. A Ty?`}
			/>
		</div>
	</section>
{:else}
	<Button
		size="lg"
		class="h-14 w-full bg-white label-caps text-base text-black hover:bg-primary hover:text-primary-foreground"
		onclick={reveal}
	>
		Policz
	</Button>
{/if}

<SiteFooter>
	{#snippet notes()}
		<p>
			Założenia: standardowe koszty uzyskania przychodu, rozliczenie indywidualne, bez innych ulg i
			odliczeń. Kwoty uśrednione w skali roku.
		</p>
		<p>
			Kwoty według stanu prawnego na 2026 r. Przeczytaj
			<a
				href="https://github.com/karol-gro/meska-emerytura/blob/main/docs/PIT-0-ALGORYTM.md"
				target="_blank"
				rel="noopener noreferrer"
				class="underline underline-offset-2 hover:text-foreground">tutaj</a
			> o tym, jak te kwoty są wyliczane.
		</p>
	{/snippet}
</SiteFooter>
