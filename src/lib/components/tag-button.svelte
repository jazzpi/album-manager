<script lang="ts">
	import type { Tag } from '$lib/db/query-results';

	export let tag: Tag;
	export let showDismiss = false;

	const tagColors = [
		'bg-red-600',
		'bg-orange-600',
		'bg-yellow-600',
		'bg-lime-600',
		'bg-emerald-600',
		'bg-cyan-600',
		'bg-blue-600',
		'bg-violet-600',
		'bg-fuchsia-600',
		'bg-pink-600',
		'bg-rose-600'
	];

	$: color = tagColors[tag.id % tagColors.length];
</script>

<button type="button" class="group relative rounded-md px-2 py-1 text-xs {color}" on:click>
	{tag.name}
	{#if showDismiss}
		<i class="bx bx-x absolute right-0 top-0 hidden text-white group-hover:block"></i>
	{/if}
</button>
