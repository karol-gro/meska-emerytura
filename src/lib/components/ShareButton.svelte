<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { IconShare, IconLink, IconCheck } from '@tabler/icons-svelte';

	// shareText podaje strona – każdy kalkulator ma własny komunikat
	let { url, shareText }: { url: string; shareText: string } = $props();

	let copied = $state(false);

	// Web Share API bywa niedostępne (np. Firefox na desktopie) – wtedy przycisk chowamy
	const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

	async function copy() {
		await navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	async function share() {
		try {
			await navigator.share({ title: 'Męska emerytura', text: shareText, url });
		} catch {
			// użytkownik anulował udostępnianie – ignorujemy
		}
	}
</script>

<div class="flex flex-wrap items-center justify-end gap-2">
	{#if canShare}
		<Button
			size="lg"
			class="bg-white label-caps text-black hover:bg-primary hover:text-primary-foreground"
			onclick={share}
		>
			<IconShare aria-hidden="true" />
			Udostępnij wynik
		</Button>
	{/if}

	<Button size="lg" variant="secondary" class="label-caps" onclick={copy}>
		{#if copied}
			<IconCheck aria-hidden="true" />
			Skopiowano
		{:else}
			<IconLink aria-hidden="true" />
			Skopiuj link
		{/if}
	</Button>
</div>
