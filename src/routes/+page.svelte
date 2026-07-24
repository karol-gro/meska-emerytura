<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import AssumptionsPanel from '$lib/components/AssumptionsPanel.svelte';
	import InputsForm from '$lib/components/InputsForm.svelte';
	import ResultsPanel from '$lib/components/ResultsPanel.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import WarningsList from '$lib/components/WarningsList.svelte';
	import { Button } from '$lib/components/ui/button';
	import { CalculatorState } from '$lib/state/calculator.svelte';
	import { formatPln } from '$lib/format';

	const today = new Date();
	const calc = new CalculatorState(
		{ year: today.getFullYear(), month: today.getMonth() + 1 },
		page.url
	);

	// wyniki od razu, gdy ktoś wszedł z udostępnionego linka; inaczej czekamy na „Policz"
	let showResults = $state(calc.startedFromLink);
	let resultsSection = $state<HTMLElement>();

	// czekamy na flush DOM-u (tick) i domknięcie layoutu przeglądarki (rAF),
	// inaczej scrollIntoView liczy pozycję zanim strona się w pełni ułoży
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

	// dane z udostępnionego linka znikają z paska adresu, a strona przewija się do wyników
	onMount(() => {
		if (calc.startedFromLink) {
			calc.stripShareParam();
			scrollToResults();
		}
	});
</script>

<header class="grid gap-3">
	<p class="text-lg text-muted-foreground">
		Kobiety przechodzą na emeryturę w wieku 60 lat, mężczyźni – 65. Mężczyzna, jeśli chce przestać
		pracować w wieku 60 lat, musi sam odłożyć środki.
	</p>
	<p class="text-lg text-muted-foreground">
		Policz, ile mężczyzna musi odkładać, aby sfinansować emeryturę w wieku 60 lat.
	</p>
</header>

<InputsForm state={calc} />
<AssumptionsPanel state={calc} />

{#if showResults}
	<section bind:this={resultsSection} class="grid scroll-mt-6 gap-8">
		<WarningsList warnings={calc.result.warnings} />
		<ResultsPanel result={calc.result} />
		<div class="flex justify-end">
			<ShareButton
				url={calc.shareUrl}
				shareText={`Mój „podatek od płci" to ${formatPln(calc.result.monthlyContribution)} miesięcznie – tyle muszę odkładać, żeby przejść na emeryturę tak wcześnie jak kobiety. A Twój?`}
			/>
		</div>
		<p class="text-right text-sm text-muted-foreground">
			<a href="/pit-0" class="underline underline-offset-2 hover:text-foreground">
				Policz też, ile Cię kosztuje brak ulgi PIT-0 →
			</a>
		</p>
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
			To prognoza, nie obietnica. Nikt nie wie, jak rynki i inflacja zachowają się przez najbliższe
			30 lat.
		</p>
		<p>
			Wyliczona wpłata jest w dzisiejszych pieniądzach. Co roku podnoś ją o inflację. Przeczytaj
			<a
				href="https://github.com/karol-gro/meska-emerytura/blob/main/docs/IKE-ALGORYTM.md"
				target="_blank"
				rel="noopener noreferrer"
				class="underline underline-offset-2 hover:text-foreground">tutaj</a
			> o tym, jak te kwoty są wyliczane.
		</p>
	{/snippet}
</SiteFooter>
