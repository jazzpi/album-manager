import {
	SpotifyApi,
	type AccessToken,
	type IAuthStrategy,
	type Image
} from '@spotify/web-api-ts-sdk';
import { page } from '$app/stores';
import { get } from 'svelte/store';
import { signIn } from '@auth/sveltekit/client';
import { browser } from '$app/environment';

// Adapted from the next-auth example in the spotify web API SDK
// https://github.com/spotify/spotify-web-api-ts-sdk/blob/main/example_next/src/lib/spotify-sdk/ClientInstance.ts
class NextAuthStrategy implements IAuthStrategy {
	public getOrCreateAccessToken(): Promise<AccessToken> {
		return this.getAccessToken();
	}

	public async getAccessToken(): Promise<AccessToken> {
		if (!browser) {
			throw new Error('getAccessToken can only be called in the browser');
		}
		const session = get(page).data.session;
		if (!session || session.error == 'RefreshAccessTokenError' || !session.user.access_token) {
			await signIn('spotify');
			return this.getAccessToken();
		}

		return session.user.access_token;
	}

	public removeAccessToken(): void {
		console.warn('removeAccessToken not implemented');
	}

	public setConfiguration(): void {
		console.warn('setConfiguration not implemented');
	}
}

export const sdk = new SpotifyApi(new NextAuthStrategy());

export function getMaxResolutionImage(images: Image[]): Image {
	return images.reduce((prev, current) => {
		if (prev.width > current.width) {
			return prev;
		}
		return current;
	});
}
