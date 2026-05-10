export const RECIPE_SCHEMA_VERSION = 2
export const COOKBOOK_EXPORT_SCHEMA_VERSION = 1
export const COOKBOOK_STORAGE_KEY = 'the-shed:cookbook:recipes:v1'

export interface Recipe {
	id: string
	title: string
	sourceUrl?: string
	note?: string
	tags?: string[]
	ingredients?: string[]
	imageUrl?: string
	createdAt: string
	updatedAt: string
	schemaVersion: number
}

export interface CookbookExport {
	schemaVersion: number
	exportedAt: string
	recipes: Recipe[]
}

export interface CreateRecipeInput {
	title: string
	sourceUrl?: string
	note?: string
	tags?: string[]
	ingredients?: string[]
	imageUrl?: string
}

export interface UpdateRecipeInput {
	title?: string
	sourceUrl?: string
	note?: string
	tags?: string[]
	ingredients?: string[]
	imageUrl?: string
}

export interface CookbookRepository {
	list(): Recipe[]
	getById(id: string): Recipe | null
	create(input: CreateRecipeInput): Recipe
	update(id: string, input: UpdateRecipeInput): Recipe
	remove(id: string): void
	exportData(): CookbookExport
	importData(payload: unknown): number
}
