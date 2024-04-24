import Ajv, { type JSONSchemaType } from 'ajv';
const ajv = new Ajv();

interface Artist {
	spotifyId: string;
	name: string;
}

interface Album {
	spotifyId: string;
	title: string;
	cover: string;
}

const artistSchema: JSONSchemaType<Artist> = {
	type: 'object',
	properties: {
		spotifyId: { type: 'string' },
		name: { type: 'string' }
	},
	required: ['spotifyId', 'name']
};

const albumSchema: JSONSchemaType<Album> = {
	type: 'object',
	properties: {
		spotifyId: { type: 'string' },
		title: { type: 'string' },
		cover: { type: 'string' }
	},
	required: ['spotifyId', 'title', 'cover']
};

export interface AddAlbumRequest {
	album: Album;
	artists: Artist[];
}

const addAlbumRequestSchema: JSONSchemaType<AddAlbumRequest> = {
	type: 'object',
	properties: {
		album: albumSchema,
		artists: {
			type: 'array',
			items: artistSchema
		}
	},
	required: ['album', 'artists']
};

export const validateAddAlbumRequest = ajv.compile(addAlbumRequestSchema);
