<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import type { Pit0Warning } from '$lib/models/pit0';

	let { warnings }: { warnings: Pit0Warning[] } = $props();

	const MESSAGES: Record<Pit0Warning, { title: string; description: string }> = {
		NO_DIFFERENCE: {
			title: 'Przy tej pensji ulga nic nie zmienia',
			description:
				'Kwota wolna od podatku zeruje PIT zarówno mężczyzny, jak i kobiety, więc różnicy w wypłatach nie ma. „Podatek od płci" pojawia się dopiero przy wyższych zarobkach.'
		}
	};
</script>

{#each warnings as warning (warning)}
	<Alert.Root variant="default">
		<Alert.Title>{MESSAGES[warning].title}</Alert.Title>
		<Alert.Description>{MESSAGES[warning].description}</Alert.Description>
	</Alert.Root>
{/each}
