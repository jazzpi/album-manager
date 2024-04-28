<script lang="ts">
	import AlbumDisplay from '$lib/components/album-display.svelte';
	import AddAlbum from '$lib/components/add-album.svelte';
	import { albumsStore } from '$lib/stores';
	import { page } from '$app/stores';
	import Filters from '$lib/components/filters.svelte';
	import AlbumPlayer from '$lib/components/album-player.svelte';

	$: albumsStore.set($page.data.albums);
	let albumPlayer: AlbumPlayer;
</script>

<Filters />
<AddAlbum />

<div id="albums" class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
	{#each $albumsStore as album}
		<AlbumDisplay {album} on:play={() => albumPlayer.playAlbum(album.spotifyId)} />
	{/each}
</div>

<AlbumPlayer bind:this={albumPlayer} />
