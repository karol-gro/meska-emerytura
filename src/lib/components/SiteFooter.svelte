<script lang="ts">
	import type { Snippet } from 'svelte';
	import { IconCode, IconMail } from '@tabler/icons-svelte';

	// notes = część zmienna stopki, specyficzna dla danej podstrony (metodologia, zastrzeżenia).
	// Część wspólna (autor, dane, kontakt, GitHub) jest zaszyta poniżej i taka sama wszędzie.
	let { notes }: { notes?: Snippet } = $props();
</script>

<footer class="grid gap-6 text-xs text-muted-foreground">
	{#if notes}
		<div class="grid gap-2">
			{@render notes()}
		</div>
	{/if}

	<div class="flex items-end justify-between gap-4">
		<div class="grid gap-2">
			<p>
				Przygotowane przez
				<a
					href="https://kg-academy.pl"
					target="_blank"
					rel="noopener"
					class="underline underline-offset-2 hover:text-foreground"
				>
					<IconCode
						size={14}
						stroke={2}
						aria-hidden="true"
						class="mr-1 inline-block align-text-bottom"
					/>KG Academy</a
				>
				na licencji
				<a
					href="https://www.gnu.org/licenses/agpl-3.0.html"
					target="_blank"
					rel="noopener noreferrer"
					class="underline underline-offset-2 hover:text-foreground">GNU AGPL v3</a
				>.
			</p>
			<p>Nie przechowujemy po naszej stronie żadnych wprowadzonych tu danych.</p>
			<p>
				Kontakt: <a
					href="mailto:kontakt@meskaemerytura.pl"
					class="underline underline-offset-2 hover:text-foreground"
				>
					<IconMail
						size={14}
						stroke={2}
						aria-hidden="true"
						class="mr-1 inline-block align-text-bottom"
					/>kontakt@meskaemerytura.pl</a
				>
			</p>
		</div>

		<!-- Znak GitHuba pozostaje monochromatyczny – wytyczne marki GitHub nie pozwalają go przebarwiać -->
		<a
			href="https://github.com/karol-gro/meska-emerytura"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Kod źródłowy na GitHubie"
			title="Kod źródłowy na GitHubie"
			class="shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
		>
			<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="size-6">
				<path
					d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
				/>
			</svg>
		</a>
	</div>
</footer>
