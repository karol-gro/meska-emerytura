<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import type { CzasZyciaWarning } from '$lib/models/czas-zycia';

	let { warnings }: { warnings: CzasZyciaWarning[] } = $props();

	const MESSAGES: Record<CzasZyciaWarning, { title: string; description: string }> = {
		MALE_AGE_HYPOTHETICAL: {
			title: 'Wiek 60 lat jest dla mężczyzny hipotetyczny',
			description:
				'Mężczyzna przechodzi na emeryturę powszechną w wieku 65 lat. Wynik pokazuje sam efekt wspólnej tablicy dalszego trwania życia – nie realny scenariusz, w którym akurat teraz mężczyzna miałby 60 lat i przechodził na emeryturę.'
		}
	};
</script>

{#each warnings as warning (warning)}
	<Alert.Root variant="default">
		<Alert.Title>{MESSAGES[warning].title}</Alert.Title>
		<Alert.Description>{MESSAGES[warning].description}</Alert.Description>
	</Alert.Root>
{/each}
