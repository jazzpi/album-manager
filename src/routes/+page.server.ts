import db from '$lib/db/drizzle';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
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
