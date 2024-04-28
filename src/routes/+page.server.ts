import db from '$lib/db/drizzle';
import { albums, albumsToArtists, tags } from '$lib/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { filtersFromQueryParams } from '$lib/filters';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const user_id = session?.user?.user_id;
	if (!user_id) {
		return { session, albums: [] };
	}

	const filters = await filtersFromQueryParams(event.url.searchParams);
	const queryFilters = [eq(albums.userId, user_id)];
	if (filters.artist) {
		queryFilters.push(eq(albumsToArtists.artistId, filters.artist.id));
	}

	const albumIDs = db
		.selectDistinct({ id: albums.id })
		.from(albums)
		.innerJoin(albumsToArtists, eq(albums.id, albumsToArtists.albumId))
		.where(and(...queryFilters));
	const albumData = (
		await db.query.albums.findMany({
			with: {
				artists: {
					columns: {},
					with: {
						artist: true
					}
				},
				tags: {
					columns: {},
					with: {
						tag: true
					}
				}
			},
			where: inArray(albums.id, albumIDs)
		})
	).map((album) =>
		Object.assign(album, {
			artists: album.artists.map((a) => a.artist),
			tags: album.tags.map((t) => t.tag)
		})
	);
	const tagData = await db.query.tags.findMany({ where: eq(tags.userId, user_id) });
	return {
		session,
		albums: albumData,
		tags: tagData,
		filters
	};
};
