export type Artist = {
	id: string;
	name: string;
};

export type AlbumWithArtists = {
	id: string;
	title: string;
	cover: string | null;
	artists: Artist[];
};
