<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	let { url }: { url: string } = $props();

	let copied = $state(false);

	async function copy() {
		await navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<Button
	size="lg"
	class="bg-white label-caps text-black hover:bg-primary hover:text-primary-foreground"
	onclick={copy}
>
	{copied ? 'Skopiowano!' : 'Kopiuj link do udostępnienia'}
</Button>
