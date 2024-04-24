import { SpotifyApi, type Image } from '@spotify/web-api-ts-sdk';

export function initSDK(clientID: string): SpotifyApi {
	const sdk = SpotifyApi.withUserAuthorization(clientID, 'http://localhost:5173', [
		'user-library-read',
		'user-read-playback-state',
		'user-modify-playback-state'
	]);
	return sdk;
}

export function getMaxResolutionImage(images: Image[]): Image {
	return images.reduce((prev, current) => {
		if (prev.width > current.width) {
			return prev;
		}
		return current;
	});
}
