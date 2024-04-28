import db from '$lib/db/drizzle';
import { albums, albumsToTags } from '$lib/db/schema';
import { and, eq, notInArray } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { validateUpdateAlbumRequest } from '$lib/schemas.js';

export async function DELETE(event) {
	const session = await event.locals.auth();
	if (!session?.user?.user_id) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const id_numeric = Number(event.params.id);
	if (isNaN(id_numeric)) {
		return json({ success: false, error: 'Invalid album ID' }, { status: 400 });
	}

	const result = await db
		.delete(albums)
		.where(and(eq(albums.id, id_numeric), eq(albums.userId, session.user.user_id)));
	if (result.changes == 0) {
		return json({ success: false, error: 'Album not found' }, { status: 404 });
	} else {
		return new Response(null, { status: 204 });
	}
}

export async function PUT(event) {
	const session = await event.locals.auth();
	if (!session?.user?.user_id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const id_numeric = Number(event.params.id);
	if (isNaN(id_numeric)) {
		return json({ error: 'Invalid album ID' }, { status: 400 });
	}

	const data = await event.request.json();

	if (!validateUpdateAlbumRequest(data)) {
		return json(
			{ error: 'Invalid data', details: validateUpdateAlbumRequest.errors },
			{ status: 400 }
		);
	}

	const result = await db
		.update(albums)
		.set({
			id: data.id,
			...data.album
		})
		.where(and(eq(albums.id, id_numeric), eq(albums.userId, session.user.user_id)));

	if (result.changes == 0) {
		return json({ success: false, error: 'Album not found' }, { status: 404 });
	}

	let keepTagsFilter;
	if (data.tags.length > 0) {
		await db
			.insert(albumsToTags)
			.values(data.tags.map((tagId) => ({ albumId: data.id, tagId })))
			.onConflictDoNothing();
		keepTagsFilter = notInArray(albumsToTags.tagId, data.tags);
	}
	await db.delete(albumsToTags).where(and(eq(albumsToTags.albumId, data.id), keepTagsFilter));
	return json({ success: true }, { status: 200 });
}
