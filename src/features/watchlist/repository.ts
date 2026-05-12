import {
	WATCHLIST_EXPORT_SCHEMA_VERSION,
	WATCHLIST_STORAGE_KEY,
	SHOW_SCHEMA_VERSION,
	type WatchListExport,
	type WatchListRepository,
	type CreateShowInput,
	type Show,
	type UpdateShowInput,
} from './types'

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null
}

const normalizeOptionalText = (value: unknown): string | undefined => {
	if (typeof value !== 'string') return undefined
	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : undefined
}

const parseRequiredTitle = (value: unknown): string => {
	if (typeof value !== 'string' || value.trim().length === 0) {
		throw new Error('Show title is required.')
	}
	return value.trim()
}

const normalizeOptionalNumber = (value: unknown): number | undefined => {
	if (typeof value === 'number' && value > 0) return value
	return undefined
}

const normalizeOptionalDate = (value: unknown): string | undefined => {
	if (typeof value !== 'string') return undefined
	const trimmed = value.trim()
	if (!trimmed) return undefined
	const date = new Date(trimmed)
	if (Number.isNaN(date.getTime())) return undefined
	return date.toISOString()
}

const normalizeStatus = (value: unknown): 'not-started' | 'watching' | 'caught-up' | 'completed' | 'dropped' => {
	const validStatuses = ['not-started', 'watching', 'caught-up', 'completed', 'dropped'] as const
	if (typeof value === 'string' && validStatuses.includes(value as never)) {
		return value as 'not-started' | 'watching' | 'caught-up' | 'completed' | 'dropped'
	}
	// Migrate old status values
	if (value === 'on-hold') return 'caught-up'
	return 'watching'
}

const parseIsoDate = (value: unknown, fallback: string): string => {
	if (typeof value !== 'string') return fallback
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return fallback
	return date.toISOString()
}

const ensureCurrentShow = (raw: unknown): Show => {
	if (!isRecord(raw)) {
		throw new Error('Invalid show record format.')
	}

	const now = new Date().toISOString()
	const idValue =
		typeof raw.id === 'string' && raw.id.trim().length > 0
			? raw.id.trim()
			: crypto.randomUUID()

	const show: Show = {
		id: idValue,
		title: parseRequiredTitle(raw.title),
		status: normalizeStatus(raw.status),
		currentSeason: normalizeOptionalNumber(raw.currentSeason ?? raw.currentSeasonNumber),
		currentEpisode: normalizeOptionalNumber(raw.currentEpisode ?? raw.currentEpisodeNumber),
		totalSeasonsTracked: normalizeOptionalNumber(raw.totalSeasonsTracked),
		episodesPerSeason: normalizeOptionalNumber(raw.episodesPerSeason),
		nextSeasonNumber: normalizeOptionalNumber(raw.nextSeasonNumber),
		nextSeasonReleaseDate: normalizeOptionalDate(raw.nextSeasonReleaseDate),
		nextEpisodeReleaseDate: normalizeOptionalDate(raw.nextEpisodeReleaseDate),
		notes: normalizeOptionalText(raw.notes),
		posterUrl: normalizeOptionalText(raw.posterUrl ?? raw.imageUrl),
		createdAt: parseIsoDate(raw.createdAt, now),
		updatedAt: parseIsoDate(raw.updatedAt, now),
		schemaVersion: SHOW_SCHEMA_VERSION,
	}

	return show
}

const migrateShow = (raw: unknown): Show => {
	if (!isRecord(raw)) {
		throw new Error('Invalid show encountered during migration.')
	}

	const migrated = {
		...raw,
		schemaVersion: SHOW_SCHEMA_VERSION,
	}

	return ensureCurrentShow(migrated)
}

const parseStoredShows = (raw: string | null): Show[] => {
	if (!raw) return []

	let parsed: unknown
	try {
		parsed = JSON.parse(raw)
	} catch {
		throw new Error('Stored watch list data is corrupted JSON.')
	}

	if (!Array.isArray(parsed)) {
		throw new Error('Stored watch list data has an invalid shape.')
	}

	return parsed.map((entry) => migrateShow(entry))
}

const parseWatchListExport = (payload: unknown): WatchListExport => {
	if (!isRecord(payload)) {
		throw new Error('Import payload must be an object.')
	}

	if (payload.schemaVersion !== WATCHLIST_EXPORT_SCHEMA_VERSION) {
		throw new Error('Unsupported watch list export version.')
	}

	if (!Array.isArray(payload.shows)) {
		throw new Error('Import payload shows must be an array.')
	}

	const shows = payload.shows.map((entry) => migrateShow(entry))

	return {
		schemaVersion: WATCHLIST_EXPORT_SCHEMA_VERSION,
		exportedAt:
			typeof payload.exportedAt === 'string'
				? payload.exportedAt
				: new Date().toISOString(),
		shows,
	}
}

const saveShows = (shows: Show[]) => {
	if (typeof window === 'undefined') {
		throw new Error('Watch list local storage is unavailable on the server.')
	}
	window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(shows))
}

const readShows = (): Show[] => {
	if (typeof window === 'undefined') {
		return []
	}
	return parseStoredShows(window.localStorage.getItem(WATCHLIST_STORAGE_KEY))
}

export class LocalWatchListRepository implements WatchListRepository {
	list(): Show[] {
		return readShows().sort((a, b) => {
			const aDate = a.nextEpisodeReleaseDate ? new Date(a.nextEpisodeReleaseDate).getTime() : Infinity
			const bDate = b.nextEpisodeReleaseDate ? new Date(b.nextEpisodeReleaseDate).getTime() : Infinity
			return aDate - bDate
		})
	}

	getById(id: string): Show | null {
		const shows = readShows()
		return shows.find((show) => show.id === id) ?? null
	}

	create(input: CreateShowInput): Show {
		const now = new Date().toISOString()
		const show = ensureCurrentShow({
			id: crypto.randomUUID(),
			title: input.title,
			status: input.status ?? 'not-started',
			currentSeason: input.currentSeason,
			currentEpisode: input.currentEpisode,
			totalSeasonsTracked: input.totalSeasonsTracked,
			episodesPerSeason: input.episodesPerSeason,
			nextSeasonNumber: input.nextSeasonNumber,
			nextSeasonReleaseDate: input.nextSeasonReleaseDate,
			nextEpisodeReleaseDate: input.nextEpisodeReleaseDate,
			notes: input.notes,
			posterUrl: input.posterUrl,
			createdAt: now,
			updatedAt: now,
			schemaVersion: SHOW_SCHEMA_VERSION,
		})

		const shows = readShows()
		shows.push(show)
		saveShows(shows)

		return show
	}

	update(id: string, input: UpdateShowInput): Show {
		const shows = readShows()
		const current = shows.find((show) => show.id === id)
		if (!current) {
			throw new Error('Show not found.')
		}

		const updated = ensureCurrentShow({
			...current,
			title: input.title ?? current.title,
			status: input.status ?? current.status,
			currentSeason: input.currentSeason ?? current.currentSeason,
			currentEpisode: input.currentEpisode ?? current.currentEpisode,
			totalSeasonsTracked: input.totalSeasonsTracked ?? current.totalSeasonsTracked,
			episodesPerSeason: input.episodesPerSeason ?? current.episodesPerSeason,
			nextSeasonNumber: input.nextSeasonNumber ?? current.nextSeasonNumber,
			nextSeasonReleaseDate: input.nextSeasonReleaseDate ?? current.nextSeasonReleaseDate,
			nextEpisodeReleaseDate: input.nextEpisodeReleaseDate ?? current.nextEpisodeReleaseDate,
			notes: input.notes ?? current.notes,
			posterUrl: input.posterUrl ?? current.posterUrl,
			updatedAt: new Date().toISOString(),
		})

		const updatedShows = shows.map((show) =>
			show.id === id ? updated : show
		)
		saveShows(updatedShows)
		return updated
	}

	remove(id: string): void {
		const shows = readShows()
		const updatedShows = shows.filter((show) => show.id !== id)
		saveShows(updatedShows)
	}

	exportData(): WatchListExport {
		return {
			schemaVersion: WATCHLIST_EXPORT_SCHEMA_VERSION,
			exportedAt: new Date().toISOString(),
			shows: readShows(),
		}
	}

	importData(payload: unknown): number {
		const parsed = parseWatchListExport(payload)
		saveShows(parsed.shows)
		return parsed.shows.length
	}
}

export const watchListRepository = new LocalWatchListRepository()
