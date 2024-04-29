<script lang="ts">
	import type { AlbumData } from '$lib/db/query-results';
	import { albumsStore } from '$lib/stores';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import TagButton from './tag-button.svelte';

	export let album: AlbumData;

	$: cover = album.cover;

	const dispatch = createEventDispatcher();

	async function deleteAlbum(id: number) {
		try {
			const result = await fetch(`/albums/${id}`, { method: 'DELETE' });
			if (result.status !== 204) {
				throw new Error('Failed to delete album');
			}
			$albumsStore = $albumsStore.filter((album) => album.id !== id);
		} catch (error) {
			console.error(error);
			alert('Failed to delete album');
		}
	}

	function filterArtist(id: number) {
		// if we just mutate the URL, SvelteKit might not re-render the page
		const url = new URL($page.url);
		url.searchParams.set('artist', id.toString());
		goto(url);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="group rounded-md bg-slate-900 p-1 transition hover:z-10 hover:scale-105" on:click>
	<div class="relative mb-2">
		<img class="w-full" src={cover} alt="Album cover" />
		<button
			class="absolute right-0 top-0 hidden size-10 rounded-bl bg-black
		bg-opacity-50 p-1 text-xl text-white transition hover:bg-opacity-60
		group-hover:block"
			on:click|stopPropagation={() => deleteAlbum(album.id)}
		>
			<i class="bx bx-trash"></i>
		</button>
		<button
			class="absolute left-1/2 top-1/2 hidden size-20 -translate-x-1/2
			-translate-y-1/2 rounded bg-black bg-opacity-50 text-6xl
			transition hover:bg-opacity-60 group-hover:block"
			on:click|stopPropagation={() => dispatch('play')}
		>
			<i class="bx bx-play"></i>
		</button>
	</div>
	<div class="text-center font-bold">{album.title}</div>
	<div class="text-center">
		{#each album.artists as artist, i}
			<button class="hover:underline" on:click|stopPropagation={() => filterArtist(artist.id)}
				>{artist.name}</button
			>{#if i != album.artists.length - 1},&thinsp;
			{/if}
		{/each}
	</div>
	<div>
		{#each album.tags as tag}
			<span class="mx-1">
				<TagButton showDismiss={false} {tag} />
			</span>
		{/each}
	</div>
</div>
