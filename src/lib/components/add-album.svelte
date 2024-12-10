<script lang="ts">
	import { sdk as spotify, getMaxResolutionImage, getMinResolutionImage } from '$lib/spotify';
	import { albumsStore } from '$lib/stores';
	import { type AddAlbumRequest } from '$lib/schemas';
	import type { SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
	import SearchWithSuggestions from './search-with-suggestions.svelte';
	import type { ComponentEvents } from 'svelte';
	let albumUrl = '';

	export function setUrl(url: string) {
		albumUrl = url;
	}

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
				cover: getMaxResolutionImage(album.images).url,
				description: null
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
				{
					...data.album,
					artists: resultData.artists,
					id: resultData.id,
					tags: []
				},
				...$albumsStore
			];
		}
	}

	let shownSuggestions: SimplifiedAlbum[] = [];

	async function searchAlbum(
		ev: ComponentEvents<SearchWithSuggestions<SimplifiedAlbum>>['search']
	) {
		if (ev.detail.length < 3) {
			shownSuggestions = [];
			return;
		}
		const result = await spotify.search(ev.detail, ['album']);
		shownSuggestions = result.albums.items;
	}

	async function addNew(ev: ComponentEvents<SearchWithSuggestions<SimplifiedAlbum>>['new']) {
		albumUrl = ev.detail;
		addAlbum();
	}

	async function addSelected(
		ev: ComponentEvents<SearchWithSuggestions<SimplifiedAlbum>>['selected']
	) {
		albumUrl = ev.detail.id;
		addAlbum();
	}
</script>

<div class="">
	<form
		on:submit|preventDefault={addAlbum}
		class="mx-auto mb-4 flex w-full max-w-screen-md flex-row"
	>
		<SearchWithSuggestions
			{shownSuggestions}
			placeholder="Paste link or album ID"
			formClasses="grow"
			inputClasses="auto w-full rounded-l bg-gray-100 p-1 text-black placeholder:text-gray-400"
			on:search={searchAlbum}
			on:new={addNew}
			on:selected={addSelected}
			let:option
			let:selected
		>
			<div class="flex w-full flex-row space-x-2 border-t-2 p-1" class:bg-blue-600={selected}>
				<img src={getMinResolutionImage(option.images).url} alt={option.name} class="h-12 w-12" />
				<div class="flex grow flex-col space-y-1">
					<span><strong>{option.name}</strong></span>
					<span>{option.artists.map((a) => a.name).join(', ')}</span>
				</div>
			</div>
		</SearchWithSuggestions>
		<button type="submit" class="rounded-r bg-blue-700 p-1 font-semibold">Add Album</button>
	</form>
</div>
