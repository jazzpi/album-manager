<script lang="ts">
	import type { Device } from '@spotify/web-api-ts-sdk';
	import Modal from './modal.svelte';
	import { sdk as spotify } from '$lib/spotify';

	let showDeviceSelectModal = false;
	let playAlbumAfterDeviceSelect: string | undefined;
	let availableDevices: Device[] = [];
	let selectedDevice: string | undefined;

	export async function playAlbum(id: string, device?: string) {
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
