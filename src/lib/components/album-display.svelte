<script lang="ts">
	import type { AlbumWithArtists } from '$lib/db/query-results';
	import { sdk as spotify } from '$lib/spotify';
	import { albumsStore } from '$lib/stores';
	import Modal from '$lib/components/modal.svelte';
	import type { Device, SpotifyApi } from '@spotify/web-api-ts-sdk';

	export let album: AlbumWithArtists;

	$: artists = album.artists.map((artist) => artist.name).join(', ');
	$: cover = album.cover;

	let showDeviceSelectModal = false;
	let playAlbumAfterDeviceSelect: string | undefined;
	let availableDevices: Device[] = [];
	let selectedDevice: string | undefined;

	async function deleteAlbum(id: number) {
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
	}

	async function playAlbum(id: string, device?: string) {
		if (!device) {
			const state = await spotify.player.getPlaybackState();
			if (!state || state.device.id == null) {
				// Can't start playback without a device
				playAlbumAfterDeviceSelect = id;
				await updateAvailableDevices();
				showDeviceSelectModal = true;
				return;
			}
			// Set to an empty string to use the active device
			device = '';
		}
		await spotify.player.togglePlaybackShuffle(false, device);
		await spotify.player.startResumePlayback(device, `spotify:album:${id}`);
	}

	async function updateAvailableDevices() {
		availableDevices = (await spotify.player.getAvailableDevices()).devices;
	}

	async function selectDevice() {
		showDeviceSelectModal = false;
		if (!playAlbumAfterDeviceSelect) {
			console.error('No album to play after device select');
			return;
		}
		playAlbum(playAlbumAfterDeviceSelect, selectedDevice);
	}
</script>

<div class="group transition hover:z-10 hover:scale-105">
	<div class="relative mb-2">
		<img class="w-full" src={cover} alt="Album cover" />
		<button
			class="absolute right-0 top-0 hidden size-10 rounded-bl bg-black
		bg-opacity-50 p-1 text-xl text-white transition hover:bg-opacity-60
		group-hover:block"
			on:click={() => deleteAlbum(album.id)}
		>
			<i class="bx bx-trash"></i>
		</button>
		<button
			class="absolute left-1/2 top-1/2 hidden size-20 -translate-x-1/2
			-translate-y-1/2 rounded bg-black bg-opacity-50 text-6xl
			transition hover:bg-opacity-60 group-hover:block"
			on:click={() => playAlbum(album.spotifyId)}
		>
			<i class="bx bx-play"></i>
		</button>
	</div>
	<div class="text-center font-bold">{album.title}</div>
	<div class="text-center">{artists}</div>
</div>

<Modal bind:showModal={showDeviceSelectModal} title="Select a Device">
	<form on:submit|preventDefault={() => null}>
		<select
			class="mb-2 h-10 w-full rounded bg-slate-100 p-2 text-slate-900"
			bind:value={selectedDevice}
		>
			{#each availableDevices as device}
				<option value={device.id}>{device.name}</option>
			{/each}
		</select>

		<div class="flex flex-row gap-2">
			<button
				class="grow rounded bg-blue-500 px-4 py-2 font-semibold"
				on:click={() => selectDevice()}>Select</button
			>
			<button
				class="rounded bg-stone-400 px-4 py-2 font-semibold"
				on:click={() => updateAvailableDevices()}>Refresh List</button
			>
		</div>
	</form>
</Modal>
