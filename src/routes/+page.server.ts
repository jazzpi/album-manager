import db from '$lib/db/drizzle';
import { albums } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const user_id = session?.user?.user_id;
	if (!user_id) {
		return { session, albums: [] };
	}

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
				},
				where: eq(albums.userId, user_id)
			})
		).map((album) => Object.assign(album, { artists: album.artists.map((a) => a.artist) }))
	};
};
