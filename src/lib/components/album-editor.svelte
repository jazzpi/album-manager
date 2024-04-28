<script lang="ts">
	import type { AlbumWithArtists } from '$lib/db/query-results';
	import type { UpdateAlbumRequest } from '$lib/schemas';
	import Modal from './modal.svelte';

	let album: AlbumWithArtists | undefined;
	let showModal = false;

	export function edit(albumToEdit: AlbumWithArtists) {
		album = albumToEdit;
		showModal = true;
	}

	let saving = false;

	async function save() {
		if (!album) return;

		saving = true;
		const data: UpdateAlbumRequest = {
			id: album.id,
			album: {
				title: album.title,
				spotifyId: album.spotifyId,
				cover: album.cover,
				description: album.description
			}
		};
		try {
			const response = await fetch(`/albums/${album.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});
			const responseData = await response.json();
			if (response.status != 200) {
				throw new Error(`Failed to save album: ${response.status} ${JSON.stringify(responseData)}`);
			}
		} catch (error) {
			console.error(error);
			alert('Failed to save album');
		}
		saving = false;
		showModal = false;
	}
</script>

<Modal title={album?.title ?? 'Edit Album'} bind:showModal>
	{#if album}
		<form on:submit|preventDefault={() => save()}>
			<img class="mb-2 size-96" src={album.cover} alt="Album cover" />
			<div class="mb-2 text-sm font-semibold">
				{#each album.artists as artist, i}
					{artist.name}{#if i != album.artists.length - 1},&thinsp;{/if}
				{/each}
			</div>

			<textarea
				class="mb-3 h-32 w-full rounded bg-slate-600 p-2 placeholder:italic"
				bind:value={album.description}
				placeholder="Add description"
			></textarea>

			{#if saving}
				<button class="rounded bg-stone-400 px-4 py-2 font-semibold" disabled>Saving...</button>
			{:else}
				<button class="rounded bg-blue-500 px-4 py-2 font-semibold" type="submit">Save</button>
			{/if}
		</form>
	{:else}
		<div>Loading...</div>
	{/if}
</Modal>
