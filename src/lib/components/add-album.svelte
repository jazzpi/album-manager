<script lang="ts">
	import { sdk as spotify, getMaxResolutionImage } from '$lib/spotify';
	import { albumsStore } from '$lib/stores';
	import { type AddAlbumRequest } from '$lib/schemas';
	let albumUrl = '';

	function extractIdFromUrl(url: string): string {
		let matches = url.match('open.spotify.com/album/(.*)\\??');
		if (!matches || matches[1].length === 0) {
			throw new Error('Invalid URL');
		}
		return matches[1];
	}

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

		const data: AddAlbumRequest = {
			album: {
				spotifyId: album.id,
				title: album.name,
				cover: getMaxResolutionImage(album.images).url
			},
			artists: album.artists.map((artist) => ({
				spotifyId: artist.id,
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
			const resultData = await result.json();
			$albumsStore = [
				...$albumsStore,
				{
					...data.album,
					artists: resultData.artists,
					id: resultData.id
				}
			];
		}
	}
</script>

<div class="">
	<form
		on:submit|preventDefault={addAlbum}
		class="mx-auto mb-4 flex w-full max-w-screen-md flex-row"
	>
		<input
			type="text"
			bind:value={albumUrl}
			class="auto grow rounded-l bg-gray-100 p-1 text-black placeholder:text-gray-400"
			placeholder="Paste link or album ID"
		/><button type="submit" class="rounded-r bg-blue-700 p-1 font-semibold">Add Album</button>
	</form>
</div>
