import db from '$lib/db/drizzle';
import { albums } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function DELETE({ params }) {
	const result = await db.delete(albums).where(eq(albums.id, params.id));
	if (result.changes == 0) {
		return json({ success: false, error: 'Album not found' }, { status: 404 });
	} else {
		return new Response(null, { status: 204 });
	}
}
