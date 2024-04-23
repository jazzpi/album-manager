<script lang="ts">
	import { onMount } from 'svelte';
	import { initSDK } from '$lib/spotify';
	import { PUBLIC_CLIENT_ID } from '$env/static/public';
	import AlbumDisplay from '$lib/components/album-display.svelte';
	import type { Album } from '@spotify/web-api-ts-sdk';

	const sdk = initSDK(PUBLIC_CLIENT_ID);
	let albums: Album[] = [];
	// TODO
	let album_ids = [
		'5KFtfsMy5lxO5UKVq83O2N',
		'66h0WavoqRQwNu18mzPIZH',
		'2WBrAkDpKDtCn7Ueyeg6m8',
		'4YLMKLoi42lAGbji4ZlMXH'
	];
	onMount(async () => {
		albums = await sdk.albums.get(album_ids);
	});
</script>

<div id="albums" class="pure-g">
	{#each albums as album}
		<div class="pure-u-1 pure-u-md-1-2 pure-u-lg-1-4">
			<div>
				<AlbumDisplay {album} />
			</div>
		</div>
	{/each}
</div>

<style>
	#albums.pure-g > div > div {
		padding: 0.5em;
	}
</style>
