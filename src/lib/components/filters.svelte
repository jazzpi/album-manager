<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	function clearArtistFilter() {
		const url = new URL($page.url);
		url.searchParams.delete('artist');
		goto(url);
	}
</script>

<div class="text-xs font-semibold">
	{#if $page.data.filters.artist}
		<button
			class="group relative rounded-full bg-green-600 px-4 py-2"
			on:click={() => clearArtistFilter()}
		>
			{$page.data.filters.artist.name}
			<i class="bx bx-x absolute right-1 top-1 hidden text-white group-hover:block"></i>
		</button>
	{/if}
</div>
