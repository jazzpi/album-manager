import db from '$lib/db/drizzle';
import { eq } from 'drizzle-orm';
import { artists } from './db/schema';

export type ArtistFilter = {
	id: number;
	name: string;
};

export type Filters = {
	artist?: ArtistFilter;
};

export async function makeArtistFilter(artistId: string): Promise<ArtistFilter | undefined> {
	const id = parseInt(artistId, 10);
	if (isNaN(id)) {
		return;
	}

	const artist = await db.query.artists.findFirst({
		where: eq(artists.id, id),
		columns: { name: true }
	});
	if (!artist) {
		return;
	}
	return { id, name: artist.name };
}

export async function filtersFromQueryParams(params: URLSearchParams): Promise<Filters> {
	const result: Filters = {};
	const artistId = params.get('artist');
	if (artistId) {
		result.artist = await makeArtistFilter(artistId);
	}
	return result;
}
