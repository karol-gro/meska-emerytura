<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import CzasZyciaAssumptionsPanel from '$lib/components/CzasZyciaAssumptionsPanel.svelte';
	import CzasZyciaInputsForm from '$lib/components/CzasZyciaInputsForm.svelte';
	import CzasZyciaResultsPanel from '$lib/components/CzasZyciaResultsPanel.svelte';
	import CzasZyciaWarningsList from '$lib/components/CzasZyciaWarningsList.svelte';
	import ShareButton from '$lib/components/ShareButton.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { Button } from '$lib/components/ui/button';
	import { CzasZyciaState } from '$lib/state/czas-zycia.svelte';
	import { formatPln } from '$lib/format';

	const calc = new CzasZyciaState(page.url);

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
		Mężczyźni statystycznie żyją krócej niż kobiety i ta różnica w Polsce jest jedną z najwyższych w
		krajach rozwiniętych. Przy tej samej emeryturze miesięcznej mężczyzna pobiera ją krócej, więc w
		sumie dostanie mniej.
	</p>
	<p class="text-lg text-muted-foreground">
		Policz, ile mężczyzna dostałby, gdyby ZUS uwzględnił jego czas życia, i o ile mniej łącznie
		dostanie od rówieśniczki na tych samych warunkach.
	</p>
</header>

<CzasZyciaInputsForm state={calc} />
<CzasZyciaAssumptionsPanel state={calc} />

{#if showResults}
	<section bind:this={resultsSection} class="grid scroll-mt-6 gap-8">
		<CzasZyciaWarningsList warnings={calc.result.warnings} />
		<CzasZyciaResultsPanel result={calc.result} pension={calc.sanitized.monthlyPension} />
		<div class="flex justify-end">
			<ShareButton
				url={calc.shareUrl}
				shareText={`Przez krótszy czas życia dostanę łącznie o ${formatPln(calc.result.lifetimeGap)} mniej emerytury niż rówieśniczka na tych samych warunkach. A Ty?`}
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
			Wszystkie kwoty są <strong>realne</strong>, czyli w dzisiejszych złotówkach. Suma za całą
			emeryturę uwzględnia waloryzację świadczeń ponad inflację, ale nie pokazuje, jak przez te
			20–25 lat urosną same liczby na przelewie.
		</p>
		<p>
			Suma za cały okres emerytury to szacunek zależny od przyjętej waloryzacji; miesięczne kwoty
			pochodzą wprost z oficjalnych tablic.
		</p>
		<p>
			Stosowanie wspólnej tablicy dla obu płci nie jest błędem ZUS – w ubezpieczeniach społecznych
			różnicowanie ze względu na płeć jest w Unii zakazane, a Trybunał Sprawiedliwości UE orzekł tak
			wprost w tej samej kwestii (wyrok
			<a
				href="https://curia.europa.eu/juris/liste.jsf?num=C-318/13"
				target="_blank"
				rel="noopener noreferrer"
				class="underline underline-offset-2 hover:text-foreground">C-318/13, X</a
			>). Ta strona nie postuluje zmiany tej zasady – pokazuje jedynie, jakie różnice wynikają z
			niej przy różnym czasie życia obu płci.
		</p>
		<p>
			Kwoty według stanu na 2026 r. Przeczytaj
			<a
				href="https://github.com/karol-gro/meska-emerytura/blob/main/docs/CZAS-ZYCIA-ALGORYTM.md"
				target="_blank"
				rel="noopener noreferrer"
				class="underline underline-offset-2 hover:text-foreground">tutaj</a
			> o tym, jak te kwoty są wyliczane.
		</p>
	{/snippet}
</SiteFooter>
