<script lang="ts">
	import * as Alert from '$lib/components/ui/alert';
	import type { CalculatorWarning } from '$lib/models/results';
	import { IKE_ANNUAL_LIMIT, MIN_IKE_CONTRIBUTION_YEARS } from '$lib/services/constants';
	import { formatPln } from '$lib/format';

	let { warnings }: { warnings: CalculatorWarning[] } = $props();

	const MESSAGES: Record<CalculatorWarning, { title: string; description: string }> = {
		IKE_LIMIT_EXCEEDED: {
			title: 'Przekroczony roczny limit wpłat na IKE',
			description: `Wymagana wpłata przekracza limit ${formatPln(IKE_ANNUAL_LIMIT)} rocznie. Nadwyżkę musisz odłożyć poza IKE (np. OKI, IKZE, konto maklerskie).`
		},
		LESS_THAN_5_YEARS: {
			title: `Mniej niż ${MIN_IKE_CONTRIBUTION_YEARS} lat wpłat do 60. urodzin`,
			description:
				'Zwolnienie podatkowe IKE wymaga wpłat w co najmniej 5 latach kalendarzowych. Część środków musisz odłożyć w poza IKE.'
		},
		NO_ACCUMULATION_PHASE: {
			title: 'Brak fazy oszczędzania',
			description:
				'Masz już 60 lat — pokazujemy tylko kapitał, jaki musiałbyś mieć zgromadzony dziś.'
		}
	};
</script>

{#each warnings as warning (warning)}
	<Alert.Root variant="destructive">
		<Alert.Title>{MESSAGES[warning].title}</Alert.Title>
		<Alert.Description>{MESSAGES[warning].description}</Alert.Description>
	</Alert.Root>
{/each}
