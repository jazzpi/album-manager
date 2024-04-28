<script lang="ts">
	import { page } from '$app/stores';
	import type { AlbumData, Tag } from '$lib/db/query-results';
	import type { UpdateAlbumRequest } from '$lib/schemas';
	import Modal from './modal.svelte';

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

	let newTag = '';
	let suggestionsContainer: HTMLDivElement;
	$: shownTags = $page.data.tags.filter((tag: Tag) =>
		tag.name.toLowerCase().includes(newTag.toLowerCase())
	);
	let selectedTagIndex: number | null = null;

	async function removeTag(id: number) {
		if (!album) return;

		album.tags = album.tags.filter((tag) => tag.id != id);

		await save(false);
	}

	async function addTag(id?: number) {
		if (!album || (id == undefined && !newTag)) return;

		let tag: Tag | undefined;
		if (id != undefined) {
			tag = ($page.data.tags as Tag[]).find((tag) => tag.id === id);
			if (tag == undefined) {
				console.error(`Tag with id ${id} not found`);
				return;
			}
		} else {
			tag = ($page.data.tags as Tag[]).find((tag) => tag.name === newTag);
		}
		if (tag == undefined) {
			const response = await fetch('/tags', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name: newTag })
			});
			if (response.status != 201) {
				console.error(`Failed to create tag: ${response.status}`);
				return;
			}
			tag = (await response.json()).tag as Tag;
		}
		if (album.tags.find((t) => t.id == tag.id)) {
			newTag = '';
			return;
		}
		album.tags = [...album.tags, tag];

		await save(false);
	}

	function updateTagSelection(ev: KeyboardEvent) {
		if (!shownTags) {
			return;
		}

		if (ev.key == 'ArrowDown') {
			if (selectedTagIndex == null) {
				selectedTagIndex = 0;
			} else if (selectedTagIndex == shownTags.length - 1) {
				selectedTagIndex = null;
			} else {
				selectedTagIndex++;
			}
		} else if (ev.key == 'ArrowUp') {
			if (selectedTagIndex == null) {
				selectedTagIndex = shownTags.length - 1;
			} else if (selectedTagIndex == 0) {
				selectedTagIndex = null;
			} else {
				selectedTagIndex--;
			}
		} else if (ev.key == 'Enter' && selectedTagIndex != null) {
			newTag = shownTags[selectedTagIndex].name;
		}
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

			<div class="mb-2 text-sm">
				{#if album.tags.length == 0}
					<div class="italic">No tags</div>
				{:else}
					{#each album.tags as tag}
						<button
							type="button"
							class="mr-2 rounded-full bg-stone-400 px-2 py-1 font-semibold"
							on:click={() => removeTag(tag.id)}>{tag.name}</button
						>
					{/each}
				{/if}
			</div>

			<form
				class="mb-3"
				on:submit|preventDefault={() => addTag()}
				on:focusin={() => {
					suggestionsContainer.classList.remove('hidden');
					selectedTagIndex = null;
				}}
				on:focusout={() => setTimeout(() => suggestionsContainer.classList.add('hidden'), 100)}
			>
				<input
					type="text"
					bind:value={newTag}
					class="w-full rounded bg-slate-600 p-1 text-sm text-white"
					placeholder="Add tag"
					on:keydown={updateTagSelection}
				/>
				<div class="relative hidden w-full" bind:this={suggestionsContainer}>
					<div class="absolute z-10 w-full bg-slate-400 text-sm" role="listbox">
						{#each shownTags as tag, idx}
							<button
								type="button"
								class="w-full border-t-2 px-2 text-left {selectedTagIndex === idx
									? 'bg-blue-600'
									: ''}"
								data-id={tag.id}
								role="option"
								aria-selected={selectedTagIndex === idx}
								on:click={() => addTag(tag.id)}>{tag.name}</button
							>
						{/each}
					</div>
				</div>
			</form>

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
