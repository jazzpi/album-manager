<script lang="ts">
	import type { AlbumWithArtists } from '$lib/db/query-results';
	import { albumsStore } from '$lib/stores';

	export let album: AlbumWithArtists;

	$: artists = album.artists.map((artist) => artist.name).join(', ');
	$: cover = album.cover;

	function deleteAlbum(id: string) {
		return async () => {
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
		};
	}
</script>

<div class="group relative transition hover:z-10 hover:scale-105">
	<img src={cover} alt="Album cover" />
	<div class="text-center font-bold">{album.title}</div>
	<div class="text-center">{artists}</div>
	<button
		class="absolute right-0 top-0 hidden size-10 rounded-bl bg-black
		bg-opacity-50 p-1 text-xl text-white transition hover:bg-opacity-60
		group-hover:block"
		on:click={deleteAlbum(album.id)}
	>
		<i class="bx bx-trash"></i>
	</button>
</div>
