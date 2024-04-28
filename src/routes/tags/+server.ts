import { validateAddTagRequest } from '$lib/schemas.js';
import { json } from '@sveltejs/kit';
import db from '$lib/db/drizzle';
import { tags } from '$lib/db/schema';

export async function POST(event) {
	const session = await event.locals.auth();
	const user_id = session?.user?.user_id;
	if (!user_id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const data = await event.request.json();
	if (!validateAddTagRequest(data)) {
		return json({ error: 'Invalid data', details: validateAddTagRequest.errors }, { status: 400 });
	}

	const result = await db
		.insert(tags)
		.values({ userId: user_id, ...data })
		.onConflictDoNothing()
		.returning({ id: tags.id, name: tags.name });
	if (result.length != 1) {
		return json({ success: false, error: 'Tag already exists' }, { status: 409 });
	}
	return json({ success: true, tag: result[0] }, { status: 201 });
}
