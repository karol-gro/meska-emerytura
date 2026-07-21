<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import AssumptionsPanel from '$lib/components/AssumptionsPanel.svelte';
	import InputsForm from '$lib/components/InputsForm.svelte';
	import ResultsPanel from '$lib/components/ResultsPanel.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import WarningsList from '$lib/components/WarningsList.svelte';
	import { Button } from '$lib/components/ui/button';
	import { CalculatorState } from '$lib/state/calculator.svelte';
	import unequalIcon from '$lib/assets/unequal.svg';

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

<svelte:head>
	<title>Męska emerytura – kalkulator nierówności emerytalnych</title>
	<meta
		name="description"
		content="Ile mężczyzna musi odkładać na IKE, żeby przejść na emeryturę w wieku 60 lat – tak jak kobieta."
	/>
</svelte:head>

<main class="mx-auto grid max-w-3xl gap-8 p-4 py-10 sm:p-8 sm:py-16">
	<header class="grid gap-3">
		<h1
			class="flex items-center gap-3 text-4xl font-extrabold tracking-tight uppercase sm:text-5xl"
		>
			<img src={unequalIcon} alt="" class="size-9 sm:size-11" />
			Męska emerytura
		</h1>
		<p class="text-lg text-muted-foreground">
			Kobiety przechodzą na emeryturę w wieku 60 lat, mężczyźni – 65. Mężczyzna, jeśli chce przestać pracować w wieku 60 lat, musi samemu odłożyć pieniądze na IKE.
		</p>
		<p class="text-lg text-muted-foreground">
			Policz, ile musisz odkładać,
			aby sfinansować emeryturę w wieku 60 lat.
		</p>
	</header>

	<InputsForm state={calc} />
	<AssumptionsPanel state={calc} />

	{#if showResults}
		<section bind:this={resultsSection} class="grid scroll-mt-6 gap-8">
			<WarningsList warnings={calc.result.warnings} />
			<ResultsPanel result={calc.result} />
			<div class="flex justify-end">
				<ShareButton url={calc.shareUrl} />
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

	<footer class="grid gap-2 text-xs text-muted-foreground">
		<p>
			To prognoza, nie obietnica. Nikt nie wie, jak rynki i inflacja zachowają się przez najbliższe
			30 lat, dlatego wynik traktuj jako punkt odniesienia.
		</p>
		<p>
			Wyliczona wpłata jest w dzisiejszych pieniądzach, co roku podnoś ją o inflację. Przeczytaj
			<a
				href="https://github.com/karol-gro/meska-emerytura/blob/main/docs/IKE-ALGORYTM.md"
				target="_blank"
				rel="noopener noreferrer"
				class="underline underline-offset-2 hover:text-foreground">tutaj</a
			> o tym, jak te kwoty są wyliczane.
		</p>
		<p>Nie przechowujemy żadnych wprowadzonych tu danych po naszej stronie.</p>
	</footer>
</main>
