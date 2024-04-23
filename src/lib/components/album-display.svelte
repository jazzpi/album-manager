<script lang="ts">
	import type { Album } from '@spotify/web-api-ts-sdk';

	export let album: Album;

	$: artists = album.artists.map((artist) => artist.name).join(', ');
	$: image_sources = album.images.map((image) => `${image.url} ${image.width}w`).join(', ');
	$: image_sizes = album.images.map((image) => `${image.width}px`).join(', ');
</script>

<img srcset={image_sources} sizes={image_sizes} alt="Album cover" />
<div class="name">{album.name}</div>
<div class="artists">{artists}</div>

<style>
	img {
		width: 100%;
		height: auto;
	}
	.artists {
		text-align: center;
	}
	.name {
		text-align: center;
		font-weight: bold;
	}
</style>
