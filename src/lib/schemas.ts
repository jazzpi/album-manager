import Ajv, { type JSONSchemaType } from 'ajv';
const ajv = new Ajv();

interface Artist {
	spotifyId: string;
	name: string;
}

interface Album {
	spotifyId: string;
	title: string;
	cover: string | null;
	description?: string | null;
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
		cover: { type: 'string' },
		description: { type: 'string', nullable: true }
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

export interface UpdateAlbumRequest {
	id: number;
	album: Album;
	tags: number[];
}

const updateAlbumRequestSchema: JSONSchemaType<UpdateAlbumRequest> = {
	type: 'object',
	properties: {
		id: { type: 'number' },
		album: albumSchema,
		tags: { type: 'array', items: { type: 'number' } }
	},
	required: ['id', 'album', 'tags']
};

export const validateUpdateAlbumRequest = ajv.compile(updateAlbumRequestSchema);

export interface AddTagRequest {
	name: string;
}

const addTagRequestSchema: JSONSchemaType<AddTagRequest> = {
	type: 'object',
	properties: {
		name: { type: 'string' }
	},
	required: ['name']
};

export const validateAddTagRequest = ajv.compile(addTagRequestSchema);
