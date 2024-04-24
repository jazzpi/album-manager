<script lang="ts">
	import { PUBLIC_CLIENT_ID } from '$env/static/public';
	import { getMaxResolutionImage, initSDK } from '$lib/spotify';
	import { albumsStore } from '$lib/stores';
	let albumUrl = '';

	function extractIdFromUrl(url: string): string {
		let matches = url.match('open.spotify.com/album/(.*)\\??');
		if (!matches || matches[1].length === 0) {
			throw new Error('Invalid URL');
		}
		return matches[1];
	}

	const spotify = initSDK(PUBLIC_CLIENT_ID);

	async function addAlbum() {
		let id;
		if (albumUrl.indexOf('/') !== -1) {
			id = extractIdFromUrl(albumUrl);
		} else {
			id = albumUrl;
		}

		let album;
		try {
			album = await spotify.albums.get(id);
		} catch (error) {
			alert('Album not found');
			return;
		}

		const data = {
			album: {
				id: album.id,
				title: album.name,
				cover: getMaxResolutionImage(album.images).url
			},
			artists: album.artists.map((artist) => ({
				id: artist.id,
				name: artist.name
			}))
		};
		let result;
		try {
			result = await fetch('/albums', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
		} catch (error) {
			console.error(error);
			alert('Failed to add album');
		}
		if (result?.status == 201) {
			$albumsStore = [
				...$albumsStore,
				{
					...data.album,
					artists: data.artists
				}
			];
		}
	}
</script>

<div class="add-album">
	<form on:submit|preventDefault={addAlbum}>
		<label>
			Enter album URL or ID:
			<input type="text" bind:value={albumUrl} />
		</label>
		<button type="submit">Add Album</button>
	</form>
</div>
