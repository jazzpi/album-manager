export type Artist = {
	id: number;
	spotifyId: string;
	name: string;
};

export type AlbumWithArtists = {
	id: number;
	spotifyId: string;
	title: string;
	cover: string | null;
	description: string | null;
	artists: Artist[];
};
