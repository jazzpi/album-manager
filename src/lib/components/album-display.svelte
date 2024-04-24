<script lang="ts">
	import type { AlbumWithArtists } from '$lib/db/query-results';

	export let album: AlbumWithArtists;

	$: artists = album.artists.map((artist) => artist.name).join(', ');
	$: cover = album.cover;
</script>

<img src={cover} alt="Album cover" />
<div class="text-center font-bold">{album.title}</div>
<div class="text-center">{artists}</div>
