import { sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const albums = sqliteTable('albums', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	cover: text('cover')
});

export const artists = sqliteTable('artists', {
	id: text('id').primaryKey(),
	name: text('name').notNull()
});

export const albumsToArtists = sqliteTable(
	'albums_to_artists',
	{
		albumId: text('album_id')
			.notNull()
			.references(() => albums.id, { onDelete: 'cascade' }),
		artistId: text('artist_id')
			.notNull()
			.references(() => artists.id)
	},
	(t) => ({
		pk: primaryKey({ columns: [t.albumId, t.artistId] })
	})
);

export const albumsRelations = relations(albums, ({ many }) => ({
	artists: many(albumsToArtists)
}));

export const artistsRelations = relations(artists, ({ many }) => ({
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
