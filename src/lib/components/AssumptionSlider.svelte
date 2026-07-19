<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';

	let {
		label,
		description,
		/** wartość jako ułamek (0.06 = 6%) */
		value,
		min,
		max,
		step = 0.1,
		digits = 1,
		onchange
	}: {
		label: string;
		description?: string;
		value: number;
		min: number;
		max: number;
		step?: number;
		digits?: number;
		onchange: (fraction: number) => void;
	} = $props();

	// suwak operuje na procentach — czytelne kroki (0.1 p.p.) bez błędów zmiennoprzecinkowych
	const percent = $derived(Math.round(value * 1000) / 10);
</script>

<div class="grid gap-2">
	<div class="flex items-baseline justify-between gap-2">
		<Label>{label}</Label>
		<span class="text-sm font-medium tabular-nums"
			>{percent.toLocaleString('pl-PL', { maximumFractionDigits: digits })}%</span
		>
	</div>
	<Slider
		type="single"
		value={percent}
		min={min * 100}
		max={max * 100}
		{step}
		onValueChange={(p: number) => onchange(p / 100)}
	/>
	{#if description}
		<p class="text-sm text-muted-foreground">{description}</p>
	{/if}
</div>
