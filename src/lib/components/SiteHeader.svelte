<script lang="ts">
	import { page } from '$app/state';
	import unequalIcon from '$lib/assets/unequal.svg';

	// Zakładki nawigacji – wspólne dla wszystkich podstron
	const tabs = [
		{ href: '/', label: 'Wiek emerytalny' },
		{ href: '/pit-0', label: 'PIT-0 dla seniora' }
	];

	// aktywna, gdy ścieżka się zgadza (z tolerancją na końcowy ukośnik z prerenderu)
	function isActive(href: string): boolean {
		const path = page.url.pathname.replace(/\/$/, '') || '/';
		return path === href;
	}
</script>

<header class="grid gap-5">
	<!-- Zakładki: osobny rząd nad tytułem, wyrównane do prawej; aktywna w kolorze i podkreślona -->
	<nav class="flex flex-wrap justify-end gap-x-6 gap-y-2" aria-label="Kalkulatory">
		{#each tabs as tab (tab.href)}
			<a
				href={tab.href}
				aria-current={isActive(tab.href) ? 'page' : undefined}
				class={[
					'border-b-2 pb-1 text-sm font-bold transition-colors focus-visible:outline-none',
					isActive(tab.href)
						? 'border-primary text-primary'
						: 'border-transparent text-muted-foreground hover:text-primary focus-visible:text-primary'
				]}
			>
				{tab.label}
			</a>
		{/each}
	</nav>

	<a href="/" class="flex items-center gap-3 rounded-none focus-visible:outline-none">
		<img src={unequalIcon} alt="" class="size-9 sm:size-11" />
		<span class="text-4xl font-extrabold tracking-tight uppercase sm:text-5xl">Męska emerytura</span
		>
	</a>
</header>
