import db from '$lib/db/drizzle';
import { albums } from '$lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function DELETE(event) {
	const session = await event.locals.auth();
	if (!session?.user?.user_id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const id_numeric = Number(event.params.id);
	if (isNaN(id_numeric)) {
		return json({ error: 'Invalid album ID' }, { status: 400 });
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
