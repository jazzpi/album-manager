import { getDB } from '$lib/db/drizzle';
import { PRIVATE_DB_PATH } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const db = getDB(PRIVATE_DB_PATH);
	return {
		session,
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
};
