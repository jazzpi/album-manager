import { SpotifyApi, type Image } from '@spotify/web-api-ts-sdk';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import { signIn } from '@auth/sveltekit/client';
import { PUBLIC_CLIENT_ID } from '$env/static/public';
import { browser } from '$app/environment';

export function initSDK(): SpotifyApi {
	const access_token = get(page).data?.session?.user?.access_token;
	if (access_token === undefined) {
		if (browser) {
			signIn('spotify');
		}
		throw new Error('No access token');
	}
	const sdk = SpotifyApi.withAccessToken(PUBLIC_CLIENT_ID, access_token);
	return sdk;
}

export function ensureSpotify(sdk?: SpotifyApi): SpotifyApi {
	return sdk ?? initSDK();
}

export function getMaxResolutionImage(images: Image[]): Image {
	return images.reduce((prev, current) => {
		if (prev.width > current.width) {
			return prev;
		}
		return current;
	});
}
