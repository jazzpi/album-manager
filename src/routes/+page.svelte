<script>
	import { onMount } from 'svelte';
    import { initSDK } from '../spotify';
    import { PUBLIC_CLIENT_ID } from '$env/static/public';
    const sdk = initSDK(PUBLIC_CLIENT_ID);
    let artist = '';
    let title = '';
    onMount(async () => {
        // TODO
        const id = '5KFtfsMy5lxO5UKVq83O2N';
        let album = await sdk.albums.get(id);
        artist = album.artists[0].name;
        title = album.name;
    });
</script>

<p>{artist} - {title}</p>
