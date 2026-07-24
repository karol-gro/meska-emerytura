<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/unequal.svg';
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<main class="mx-auto grid max-w-3xl gap-8 p-4 py-10 sm:p-8 sm:py-16">
	<SiteHeader />
	{@render children()}
</main>
