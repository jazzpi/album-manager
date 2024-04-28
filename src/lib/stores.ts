import { writable } from 'svelte/store';
import type { AlbumData } from './db/query-results';

export const albumsStore = writable([] as AlbumData[]);
