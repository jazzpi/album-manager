import { json } from '@sveltejs/kit';
import db from '$lib/db/drizzle';
import { albums, albumsToArtists, artists } from '$lib/db/schema';
import { validateAddAlbumRequest } from '../../lib/schemas';
import { eq, or } from 'drizzle-orm';

export async function POST(event) {
	const session = await event.locals.auth();
	const user_id = session?.user?.user_id;
	if (!user_id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { request } = event;
	const data = await request.json();

	if (!validateAddAlbumRequest(data)) {
		return json(
			{ error: 'Invalid data', details: validateAddAlbumRequest.errors },
			{ status: 400 }
		);
	}

	let album_id: number | undefined;
	await db.transaction(async (tx) => {
		const album_ids = (
			await tx
				.insert(albums)
				.values({ userId: user_id, ...data.album })
				.onConflictDoNothing()
				.returning({ id: albums.id })
		).map((row) => row.id);
		if (album_ids.length != 1) {
			return;
		}
		album_id = album_ids[0];

		const inserted_artist_ids = await tx
			.insert(artists)
			.values(
				data.artists.map((artist) => ({
					userId: user_id,
					...artist
				}))
			)
			.onConflictDoNothing()
			.returning({ id: artists.id, spotifyId: artists.spotifyId });
		const artist_ids = inserted_artist_ids.map((row) => row.id);

		// Find artists that already existed
		if (artist_ids.length != data.artists.length) {
			const artist_id_map = new Map(inserted_artist_ids.map((row) => [row.spotifyId, row.id]));
			const artists_to_find = [];
			for (const artist of data.artists) {
				if (!artist_id_map.has(artist.spotifyId)) {
					artists_to_find.push(artist.spotifyId);
				}
			}
			const found_artist_ids = await tx.query.artists.findMany({
				where: or(...artists_to_find.map((spotifyId) => eq(artists.spotifyId, spotifyId))),
				columns: { id: true, spotifyId: true }
			});
			for (const artist of found_artist_ids) {
				artist_ids.push(artist.id);
			}
		}

		const relations = artist_ids.map((id) => ({
			userId: user_id,
			albumId: album_id,
			artistId: id
		}));
		await tx.insert(albumsToArtists).values(relations).onConflictDoNothing();
	});

	if (album_id === undefined) {
		return json({ success: false, error: 'Album already exists' }, { status: 409 });
	}
	return json({ success: true, id: album_id }, { status: 201 });
}
