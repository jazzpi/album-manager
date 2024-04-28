<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { ComponentEvents } from 'svelte';
	import SearchWithSuggestions from './search-with-suggestions.svelte';
	import TagButton from './tag-button.svelte';

	function clearArtistFilter() {
		const url = new URL($page.url);
		url.searchParams.delete('artist');
		goto(url);
	}

	function addArtistFilter(ev: ComponentEvents<SearchWithSuggestions>['selected']) {
		const url = new URL($page.url);
		url.searchParams.set('artist', ev.detail.id.toString());
		goto(url);
	}

	function addTagFilter(ev: ComponentEvents<SearchWithSuggestions>['selected']) {
		const url = new URL($page.url);
		const tags = new Set(url.searchParams.getAll('tags'));
		tags.add(ev.detail.id.toString());
		url.searchParams.delete('tags');
		for (const tag of tags) {
			url.searchParams.append('tags', tag);
		}
		goto(url);
	}

	function removeTagFilter(tagId: number) {
		const url = new URL($page.url);
		const tags = new Set(url.searchParams.getAll('tags'));
		tags.delete(tagId.toString());
		url.searchParams.delete('tags');
		for (const tag of tags) {
			url.searchParams.append('tags', tag);
		}
		goto(url);
	}
</script>

<div class="mb-4 flex w-full flex-row gap-4">
	<i class="bx bx-filter-alt"></i>
	{#each $page.data.filters.tags as tag}
		<TagButton {tag} on:click={() => removeTagFilter(tag.id)} />
	{/each}
	{#if $page.data.filters.artist}
		<button
			type="button"
			class="group relative rounded-md bg-green-600 px-2 py-1 text-xs"
			on:click={() => clearArtistFilter()}
		>
			{$page.data.filters.artist.name}
			<i class="bx bx-x absolute right-0 top-0 hidden text-white group-hover:block"></i>
		</button>
	{:else}
		<SearchWithSuggestions
			options={$page.data.artists}
			placeholder="Filter by artist"
			on:selected={addArtistFilter}
		/>
	{/if}
	<SearchWithSuggestions
		options={$page.data.tags}
		placeholder="Filter by tag"
		on:selected={addTagFilter}
	/>
</div>
