export type Artist = {
	id: number;
	spotifyId: string;
	name: string;
};

export type Tag = {
	id: number;
	name: string;
};

export type AlbumData = {
	id: number;
	spotifyId: string;
	title: string;
	cover: string | null;
	description?: string | null;
	artists: Artist[];
	tags: Tag[];
};
