export type Artist = {
	spotifyId: string;
	name: string;
};

export type AlbumWithArtists = {
	id: number;
	spotifyId: string;
	title: string;
	cover: string | null;
	artists: Artist[];
};
