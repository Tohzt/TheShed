export const SHOW_SCHEMA_VERSION = 2
export const WATCHLIST_EXPORT_SCHEMA_VERSION = 2
export const WATCHLIST_STORAGE_KEY = 'the-shed:watchlist:shows:v2'

export type ShowStatus = 'not-started' | 'watching' | 'caught-up' | 'completed' | 'dropped'

export interface Show {
	id: string
	title: string
	status: ShowStatus
	currentSeason?: number
	currentEpisode?: number
	totalSeasonsTracked?: number
	episodesPerSeason?: number
	nextSeasonNumber?: number
	nextSeasonReleaseDate?: string // YYYY-MM-DD: when next season releases
	nextEpisodeReleaseDate?: string // YYYY-MM-DD: when next episode releases
	notes?: string
	posterUrl?: string
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
	status?: ShowStatus
	currentSeason?: number
	currentEpisode?: number
	totalSeasonsTracked?: number
	episodesPerSeason?: number
	nextSeasonNumber?: number
	nextSeasonReleaseDate?: string
	nextEpisodeReleaseDate?: string
	notes?: string
	posterUrl?: string
}

export interface UpdateShowInput {
	title?: string
	status?: ShowStatus
	currentSeason?: number
	currentEpisode?: number
	totalSeasonsTracked?: number
	episodesPerSeason?: number
	nextSeasonNumber?: number
	nextSeasonReleaseDate?: string
	nextEpisodeReleaseDate?: string
	notes?: string
	posterUrl?: string
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
