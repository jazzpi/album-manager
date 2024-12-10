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
	const onAlbumSave = () => {
		$albumsStore = $albumsStore;
	};
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
	{:else}
		<div class="col-span-4 mx-auto my-4 max-w-md">
			<p class="mb-2"><strong>No albums added yet.</strong></p>
			<p>To get started, add an album above.</p>
			<p>
				You can add an album by searching for its title, or just paste the link or album ID (from
				the Spotify <strong>Share</strong> menu).
			</p>
		</div>
	{/each}
</div>

<AlbumPlayer bind:this={albumPlayer} />
<AlbumEditor bind:this={albumEditor} on:saved={onAlbumSave} />
