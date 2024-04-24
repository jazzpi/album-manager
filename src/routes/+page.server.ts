import { getDB } from '$lib/db/drizzle';
import { PRIVATE_DB_PATH } from '$env/static/private';
import type { AlbumWithArtists } from '$lib/db/query-results';

export async function load(): Promise<{ albums: AlbumWithArtists[] }> {
	const db = getDB(PRIVATE_DB_PATH);
	return {
		albums: (
			await db.query.albums.findMany({
				with: {
					artists: {
						columns: {},
						with: {
							artist: true
						}
					}
				}
			})
		).map((album) => Object.assign(album, { artists: album.artists.map((a) => a.artist) }))
	};
}
