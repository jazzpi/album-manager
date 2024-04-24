<script lang="ts">
	import type { AlbumWithArtists } from '$lib/db/query-results';

	export let album: AlbumWithArtists;

	$: artists = album.artists.map((artist) => artist.name).join(', ');
	$: cover = album.cover;
</script>

<img src={cover} alt="Album cover" />
<div class="title">{album.title}</div>
<div class="artists">{artists}</div>

<style>
	img {
		width: 100%;
		height: auto;
	}
	.artists {
		text-align: center;
	}
	.title {
		text-align: center;
		font-weight: bold;
	}
</style>
