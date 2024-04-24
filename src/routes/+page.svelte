<script lang="ts">
	import AlbumDisplay from '$lib/components/album-display.svelte';
	import AddAlbum from '$lib/components/add-album.svelte';
	import { albumsStore } from '$lib/stores';

	export let data;

	albumsStore.set(data.albums);
</script>

<AddAlbum />

<div id="albums" class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
	{#each $albumsStore as album}
		<AlbumDisplay {album} />
	{/each}
</div>
