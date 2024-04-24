import Ajv, { type JSONSchemaType } from 'ajv';
const ajv = new Ajv();

interface Artist {
	id: string;
	name: string;
}

interface Album {
	id: string;
	title: string;
	cover: string;
}

const artistSchema: JSONSchemaType<Artist> = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		name: { type: 'string' }
	},
	required: ['id', 'name']
};

const albumSchema: JSONSchemaType<Album> = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		title: { type: 'string' },
		cover: { type: 'string' }
	},
	required: ['id', 'title', 'cover']
};

interface AddAlbumRequest {
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
