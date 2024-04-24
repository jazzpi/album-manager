import { json } from '@sveltejs/kit';
import db from '$lib/db/drizzle';
import { albums, albumsToArtists, artists } from '$lib/db/schema';
import { validateAddAlbumRequest } from './schemas';

export async function POST({ request }) {
	const data = await request.json();

	if (!validateAddAlbumRequest(data)) {
		return json(
			{ error: 'Invalid data', details: validateAddAlbumRequest.errors },
			{ status: 400 }
		);
	}

	let album_changes;
	await db.transaction(async (tx) => {
		album_changes = (await tx.insert(albums).values(data.album).onConflictDoNothing()).changes;
		await tx.insert(artists).values(data.artists).onConflictDoNothing();
		const relations = data.artists.map((artist) => ({
			albumId: data.album.id,
			artistId: artist.id
		}));
		await tx.insert(albumsToArtists).values(relations).onConflictDoNothing();
	});

	if (album_changes == 0) {
		return json({ success: false, error: 'Album already exists' }, { status: 409 });
	}
	return json({ success: true }, { status: album_changes == 0 ? 204 : 201 });
}
