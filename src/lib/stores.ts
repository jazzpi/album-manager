import { writable } from 'svelte/store';
import type { AlbumWithArtists } from './db/query-results';

export const albumsStore = writable([] as AlbumWithArtists[]);
