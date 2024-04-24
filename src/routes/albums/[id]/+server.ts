import { getDB } from '$lib/db/drizzle';
import { PRIVATE_DB_PATH } from '$env/static/private';
import { albums } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function DELETE({ params }) {
	const db = getDB(PRIVATE_DB_PATH);
	const result = await db.delete(albums).where(eq(albums.id, params.id));
	if (result.changes == 0) {
		return json({ success: false, error: 'Album not found' }, { status: 404 });
	} else {
		return new Response(null, { status: 204 });
	}
}
