import db from '$lib/db/drizzle';
import { eq, inArray } from 'drizzle-orm';
import { artists, tags } from './db/schema';
import type { Tag } from './db/query-results';

export type ArtistFilter = {
	id: number;
	name: string;
};

export type Filters = {
	artist?: ArtistFilter;
	tags: Tag[];
};

async function makeArtistFilter(artistId: string | null): Promise<ArtistFilter | undefined> {
	if (artistId == null) {
		return undefined;
	}

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

async function makeTagsFilter(tagIds: string[]): Promise<Tag[]> {
	const ids = tagIds.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
	if (ids.length === 0) {
		return [];
	}

	return db.query.tags.findMany({
		where: inArray(tags.id, ids),
		columns: { id: true, name: true }
	});
}

export async function filtersFromQueryParams(params: URLSearchParams): Promise<Filters> {
	return {
		artist: await makeArtistFilter(params.get('artist')),
		tags: await makeTagsFilter(params.getAll('tags'))
	};
}
