import { SpotifyApi } from '@spotify/web-api-ts-sdk';

export function initSDK(clientID: string): SpotifyApi {
	const sdk = SpotifyApi.withUserAuthorization(clientID, 'http://localhost:5173');
	return sdk;
}
