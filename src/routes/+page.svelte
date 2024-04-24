<script lang="ts">
	import AlbumDisplay from '$lib/components/album-display.svelte';
	import AddAlbum from '$lib/components/add-album.svelte';
	import { albumsStore } from '$lib/stores.js';

	export let data;

	albumsStore.set(data.albums);
</script>

<AddAlbum />

<div id="albums" class="pure-g">
	{#each $albumsStore as album}
		<div class="pure-u-1 pure-u-md-1-2 pure-u-lg-1-4">
			<div>
				<AlbumDisplay {album} />
			</div>
		</div>
	{/each}
</div>

<style>
	#albums.pure-g > div > div {
		padding: 0.5em;
	}
</style>
