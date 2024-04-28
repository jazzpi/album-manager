<script lang="ts">
	import { page } from '$app/stores';
	import type { AlbumData, Tag } from '$lib/db/query-results';
	import type { UpdateAlbumRequest } from '$lib/schemas';
	import Modal from './modal.svelte';
	import SearchWithSuggestions from './search-with-suggestions.svelte';
	import TagButton from './tag-button.svelte';

	let album: AlbumData | undefined;
	let showModal = false;

	export function edit(albumToEdit: AlbumData) {
		album = albumToEdit;
		showModal = true;
	}

	let saving = false;

	async function save(closeAfter: boolean) {
		if (!album) return;

		saving = true;
		const data: UpdateAlbumRequest = {
			id: album.id,
			album: {
				title: album.title,
				spotifyId: album.spotifyId,
				cover: album.cover,
				description: album.description
			},
			tags: album.tags.map((tag) => tag.id)
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
		if (closeAfter) {
			showModal = false;
		}
	}

	async function removeTag(id: number) {
		if (!album) return;

		album.tags = album.tags.filter((tag) => tag.id != id);

		await save(false);
	}

	async function tagSelected(ev: CustomEvent<Tag>) {
		if (!album) {
			return;
		}

		if (album.tags.find((tag) => tag.id == ev.detail.id) == undefined) {
			album.tags = [...album.tags, ev.detail];
			await save(false);
		}
	}

	async function newTag(ev: CustomEvent<string>) {
		if (!album) {
			return;
		}

		const response = await fetch('/tags', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ name: ev.detail })
		});
		if (response.status != 201) {
			console.error(`Failed to create tag: ${response.status}`);
			return;
		}
		const tag = (await response.json()).tag as Tag;
		album.tags = [...album.tags, tag];
		await save(false);
	}
</script>

<Modal title={album?.title ?? 'Edit Album'} bind:showModal>
	{#if album}
		<form on:submit|preventDefault={() => save(true)}>
			<img class="mb-2 size-96" src={album.cover} alt="Album cover" />
			<div class="mb-2 text-sm font-semibold">
				{#each album.artists as artist, i}
					{artist.name}{#if i != album.artists.length - 1},&thinsp;{/if}
				{/each}
			</div>

			<div class="mb-2 gap-4">
				{#if album.tags.length == 0}
					<div class="italic">No tags</div>
				{:else}
					{#each album.tags as tag}
						<span class="mx-1">
							<TagButton {tag} on:click={() => removeTag(tag.id)} />
						</span>
					{/each}
				{/if}
			</div>

			<div class="mb-4">
				<SearchWithSuggestions
					options={$page.data.tags}
					placeholder="Add tag"
					on:selected={tagSelected}
					on:new={newTag}
				/>
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
