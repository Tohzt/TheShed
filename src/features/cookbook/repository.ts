import {
	COOKBOOK_EXPORT_SCHEMA_VERSION,
	COOKBOOK_STORAGE_KEY,
	RECIPE_SCHEMA_VERSION,
	type CookbookExport,
	type CookbookRepository,
	type CreateRecipeInput,
	type Recipe,
	type UpdateRecipeInput,
} from './types'

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null
}

const isValidUrl = (value: string): boolean => {
	try {
		const parsed = new URL(value)
		return parsed.protocol === 'http:' || parsed.protocol === 'https:'
	} catch {
		return false
	}
}

const normalizeOptionalText = (value: unknown): string | undefined => {
	if (typeof value !== 'string') return undefined
	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : undefined
}

const normalizeStringArray = (value: unknown): string[] | undefined => {
	if (!Array.isArray(value)) return undefined
	const filtered = value.filter((item) => typeof item === 'string' && item.trim().length > 0).map((item) => (item as string).trim())
	return filtered.length > 0 ? filtered : undefined
}

const parseRequiredTitle = (value: unknown): string => {
	if (typeof value !== 'string' || value.trim().length === 0) {
		throw new Error('Recipe title is required.')
	}
	return value.trim()
}

const parseOptionalUrl = (value: unknown): string | undefined => {
	const normalized = normalizeOptionalText(value)
	if (!normalized) return undefined
	if (!isValidUrl(normalized)) {
		throw new Error('Source URL must be a valid http(s) URL.')
	}
	return normalized
}

const parseIsoDate = (value: unknown, fallback: string): string => {
	if (typeof value !== 'string') return fallback
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return fallback
	return date.toISOString()
}

const ensureCurrentRecipe = (raw: unknown): Recipe => {
	if (!isRecord(raw)) {
		throw new Error('Invalid recipe record format.')
	}

	const now = new Date().toISOString()
	const idValue =
		typeof raw.id === 'string' && raw.id.trim().length > 0
			? raw.id.trim()
			: crypto.randomUUID()

	const recipe: Recipe = {
		id: idValue,
		title: parseRequiredTitle(raw.title),
		sourceUrl: parseOptionalUrl(raw.sourceUrl),
		note: normalizeOptionalText(raw.note),
		tags: normalizeStringArray(raw.tags),
		ingredients: normalizeStringArray(raw.ingredients),
		imageUrl: normalizeOptionalText(raw.imageUrl),
		createdAt: parseIsoDate(raw.createdAt, now),
		updatedAt: parseIsoDate(raw.updatedAt, now),
		schemaVersion: RECIPE_SCHEMA_VERSION,
	}

	return recipe
}

const migrateRecipe = (raw: unknown): Recipe => {
	if (!isRecord(raw)) {
		throw new Error('Invalid recipe encountered during migration.')
	}

	// Basic forward compatibility for old records with `name` instead of `title`.
	const migrated = {
		...raw,
		title: raw.title ?? raw.name,
		schemaVersion: RECIPE_SCHEMA_VERSION,
	}

	return ensureCurrentRecipe(migrated)
}

const parseStoredRecipes = (raw: string | null): Recipe[] => {
	if (!raw) return []

	let parsed: unknown
	try {
		parsed = JSON.parse(raw)
	} catch {
		throw new Error('Stored cookbook data is corrupted JSON.')
	}

	if (!Array.isArray(parsed)) {
		throw new Error('Stored cookbook data has an invalid shape.')
	}

	return parsed.map((entry) => migrateRecipe(entry))
}

const parseCookbookExport = (payload: unknown): CookbookExport => {
	if (!isRecord(payload)) {
		throw new Error('Import payload must be an object.')
	}

	if (payload.schemaVersion !== COOKBOOK_EXPORT_SCHEMA_VERSION) {
		throw new Error('Unsupported cookbook export version.')
	}

	if (!Array.isArray(payload.recipes)) {
		throw new Error('Import payload recipes must be an array.')
	}

	const recipes = payload.recipes.map((entry) => migrateRecipe(entry))

	return {
		schemaVersion: COOKBOOK_EXPORT_SCHEMA_VERSION,
		exportedAt:
			typeof payload.exportedAt === 'string'
				? payload.exportedAt
				: new Date().toISOString(),
		recipes,
	}
}

const saveRecipes = (recipes: Recipe[]) => {
	if (typeof window === 'undefined') {
		throw new Error('Cookbook local storage is unavailable on the server.')
	}
	window.localStorage.setItem(COOKBOOK_STORAGE_KEY, JSON.stringify(recipes))
}

const readRecipes = (): Recipe[] => {
	if (typeof window === 'undefined') {
		return []
	}
	return parseStoredRecipes(window.localStorage.getItem(COOKBOOK_STORAGE_KEY))
}

export class LocalCookbookRepository implements CookbookRepository {
	list(): Recipe[] {
		return readRecipes().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
	}

	getById(id: string): Recipe | null {
		const recipes = readRecipes()
		return recipes.find((recipe) => recipe.id === id) ?? null
	}

	create(input: CreateRecipeInput): Recipe {
		const now = new Date().toISOString()
		const recipe = ensureCurrentRecipe({
			id: crypto.randomUUID(),
			title: input.title,
			sourceUrl: input.sourceUrl,
			note: input.note,
			tags: input.tags,
			ingredients: input.ingredients,
			imageUrl: input.imageUrl,
			createdAt: now,
			updatedAt: now,
			schemaVersion: RECIPE_SCHEMA_VERSION,
		})

		const recipes = readRecipes()
		recipes.push(recipe)
		saveRecipes(recipes)

		return recipe
	}

	update(id: string, input: UpdateRecipeInput): Recipe {
		const recipes = readRecipes()
		const current = recipes.find((recipe) => recipe.id === id)
		if (!current) {
			throw new Error('Recipe not found.')
		}

		const updated = ensureCurrentRecipe({
			...current,
			title: input.title ?? current.title,
			sourceUrl: input.sourceUrl ?? current.sourceUrl,
			note: input.note ?? current.note,
			tags: input.tags ?? current.tags,
			ingredients: input.ingredients ?? current.ingredients,
			imageUrl: input.imageUrl ?? current.imageUrl,
			updatedAt: new Date().toISOString(),
		})

		const updatedRecipes = recipes.map((recipe) =>
			recipe.id === id ? updated : recipe
		)
		saveRecipes(updatedRecipes)
		return updated
	}

	remove(id: string): void {
		const recipes = readRecipes()
		const updatedRecipes = recipes.filter((recipe) => recipe.id !== id)
		saveRecipes(updatedRecipes)
	}

	exportData(): CookbookExport {
		return {
			schemaVersion: COOKBOOK_EXPORT_SCHEMA_VERSION,
			exportedAt: new Date().toISOString(),
			recipes: readRecipes(),
		}
	}

	importData(payload: unknown): number {
		const parsed = parseCookbookExport(payload)
		saveRecipes(parsed.recipes)
		return parsed.recipes.length
	}
}

export const cookbookRepository = new LocalCookbookRepository()
