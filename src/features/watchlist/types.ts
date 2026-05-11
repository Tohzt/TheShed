export const SHOW_SCHEMA_VERSION = 1
export const WATCHLIST_EXPORT_SCHEMA_VERSION = 1
export const WATCHLIST_STORAGE_KEY = 'the-shed:watchlist:shows:v1'

export interface Show {
	id: string
	title: string
	nextSeasonNumber?: number
	nextSeasonReleaseDate?: string
	notes?: string
	imageUrl?: string
	status?: 'watching' | 'completed' | 'on-hold'
	createdAt: string
	updatedAt: string
	schemaVersion: number
}

export interface WatchListExport {
	schemaVersion: number
	exportedAt: string
	shows: Show[]
}

export interface CreateShowInput {
	title: string
	nextSeasonNumber?: number
	nextSeasonReleaseDate?: string
	notes?: string
	imageUrl?: string
	status?: 'watching' | 'completed' | 'on-hold'
}

export interface UpdateShowInput {
	title?: string
	nextSeasonNumber?: number
	nextSeasonReleaseDate?: string
	notes?: string
	imageUrl?: string
	status?: 'watching' | 'completed' | 'on-hold'
}

export interface WatchListRepository {
	list(): Show[]
	getById(id: string): Show | null
	create(input: CreateShowInput): Show
	update(id: string, input: UpdateShowInput): Show
	remove(id: string): void
	exportData(): WatchListExport
	importData(payload: unknown): number
}
