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

export const usersRelations = relations(users, ({ many }) => ({
	albums: many(albums),
	artists: many(artists)
}));

export const albumsRelations = relations(albums, ({ one, many }) => ({
	user: one(users, {
		fields: [albums.userId],
		references: [users.id]
	}),
	artists: many(albumsToArtists)
}));

export const artistsRelations = relations(artists, ({ one, many }) => ({
	user: one(users, {
		fields: [artists.userId],
		references: [users.id]
	}),
	albums: many(albumsToArtists)
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
