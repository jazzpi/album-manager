<script lang="ts">
	import AlbumDisplay from '$lib/components/album-display.svelte';
	import AddAlbum from '$lib/components/add-album.svelte';
	import { albumsStore } from '$lib/stores';
	import { page } from '$app/stores';
	import Filters from '$lib/components/filters.svelte';
	import AlbumPlayer from '$lib/components/album-player.svelte';
	import AlbumEditor from '$lib/components/album-editor.svelte';
	import { onMount } from 'svelte';

	$: albumsStore.set($page.data.albums);
	let addAlbum: AddAlbum;
	let albumPlayer: AlbumPlayer;
	let albumEditor: AlbumEditor;

	onMount(() => {
		if ($page.url.searchParams.has('share-text')) {
			const text = $page.url.searchParams.get('share-text')!;
			const link = text.match('https://open.spotify.com/\\S+');
			if (link) {
				addAlbum.setUrl(link[0]);
			}
		}
	});
</script>

<AddAlbum bind:this={addAlbum} />
<Filters />

<div id="albums" class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
	{#each $albumsStore as album}
		<AlbumDisplay
			{album}
			on:play={() => albumPlayer.playAlbum(album.spotifyId)}
			on:click={() => {
				albumEditor.edit(album);
			}}
		/>
	{/each}
</div>

<AlbumPlayer bind:this={albumPlayer} />
<AlbumEditor bind:this={albumEditor} />
