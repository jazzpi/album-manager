import { sqliteTable, text, primaryKey, integer, unique } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const albums = sqliteTable(
	'albums',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		spotifyId: text('spotify_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		title: text('title').notNull(),
		cover: text('cover'),
		description: text('description')
	},
	(t) => ({
		uniq: unique().on(t.spotifyId, t.userId)
	})
);

export const artists = sqliteTable(
	'artists',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		spotifyId: text('spotify_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: text('name').notNull()
	},
	(t) => ({
		uniq: unique().on(t.spotifyId, t.userId)
	})
);

export const users = sqliteTable('users', {
	id: text('user_id').primaryKey()
});

export const tags = sqliteTable(
	'tags',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		userId: text('user_id'),
		name: text('name').notNull()
	},
	(t) => ({
		uniq: unique().on(t.userId, t.name)
	})
);

export const albumsToArtists = sqliteTable(
	'albums_to_artists',
	{
		albumId: integer('album_id').references(() => albums.id, { onDelete: 'cascade' }),
		artistId: integer('artist_id')
			.notNull()
			.references(() => artists.id)
	},
	(t) => ({
		pk: primaryKey({ columns: [t.albumId, t.artistId] })
	})
);

export const albumsToTags = sqliteTable(
	'albums_to_tags',
	{
		albumId: integer('album_id').references(() => albums.id, { onDelete: 'cascade' }),
		tagId: integer('tag_id').references(() => tags.id, { onDelete: 'cascade' })
	},
	(t) => ({
		pk: primaryKey({ columns: [t.albumId, t.tagId] })
	})
);

export const usersRelations = relations(users, ({ many }) => ({
	albums: many(albums),
	artists: many(artists),
	tags: many(tags)
}));

export const albumsRelations = relations(albums, ({ one, many }) => ({
	user: one(users, {
		fields: [albums.userId],
		references: [users.id]
	}),
	artists: many(albumsToArtists),
	tags: many(albumsToTags)
}));

export const artistsRelations = relations(artists, ({ one, many }) => ({
	user: one(users, {
		fields: [artists.userId],
		references: [users.id]
	}),
	albums: many(albumsToArtists)
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
	user: one(users, {
		fields: [tags.userId],
		references: [users.id]
	}),
	albums: many(albumsToTags)
}));

export const albumsToArtistsRelations = relations(albumsToArtists, ({ one }) => ({
	album: one(albums, {
		fields: [albumsToArtists.albumId],
		references: [albums.id]
	}),
	artist: one(artists, {
		fields: [albumsToArtists.artistId],
		references: [artists.id]
	})
}));

export const albumsToTagsRelations = relations(albumsToTags, ({ one }) => ({
	album: one(albums, {
		fields: [albumsToTags.albumId],
		references: [albums.id]
	}),
	tag: one(tags, {
		fields: [albumsToTags.tagId],
		references: [tags.id]
	})
}));
