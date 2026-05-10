import * as React from 'react'
import type { Recipe } from '../../../features/cookbook/types'

interface RecipeSearchProps {
	recipes: Recipe[]
	onFilterChange: (filtered: Recipe[]) => void
}

export const RecipeSearch: React.FC<RecipeSearchProps> = ({
	recipes,
	onFilterChange,
}) => {
	const [searchText, setSearchText] = React.useState('')
	const [selectedTags, setSelectedTags] = React.useState<string[]>([])
	const [selectedIngredients, setSelectedIngredients] = React.useState<string[]>(
		[]
	)

	// Extract all unique tags and ingredients from recipes
	const allTags = React.useMemo(() => {
		const tags = new Set<string>()
		recipes.forEach((recipe) => {
			recipe.tags?.forEach((tag) => tags.add(tag))
		})
		return Array.from(tags).sort()
	}, [recipes])

	const allIngredients = React.useMemo(() => {
		const ingredients = new Set<string>()
		recipes.forEach((recipe) => {
			recipe.ingredients?.forEach((ingredient) => ingredients.add(ingredient))
		})
		return Array.from(ingredients).sort()
	}, [recipes])

	// Filter recipes based on search criteria
	React.useEffect(() => {
		const filtered = recipes.filter((recipe) => {
			const matchesText =
				recipe.title.toLowerCase().includes(searchText.toLowerCase()) ||
				recipe.note?.toLowerCase().includes(searchText.toLowerCase())

			const matchesTags =
				selectedTags.length === 0 ||
				selectedTags.some((tag) => recipe.tags?.includes(tag))

			const matchesIngredients =
				selectedIngredients.length === 0 ||
				selectedIngredients.some((ingredient) =>
					recipe.ingredients?.includes(ingredient)
				)

			return matchesText && matchesTags && matchesIngredients
		})

		onFilterChange(filtered)
	}, [searchText, selectedTags, selectedIngredients, recipes, onFilterChange])

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		)
	}

	const toggleIngredient = (ingredient: string) => {
		setSelectedIngredients((prev) =>
			prev.includes(ingredient)
				? prev.filter((i) => i !== ingredient)
				: [...prev, ingredient]
		)
	}

	return (
		<div className='rounded-xl border border-border bg-card p-4 space-y-4'>
			{/* Search Text */}
			<div>
				<input
					type='text'
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					placeholder='🔍 Search recipes...'
					className='w-full rounded-md border border-border bg-background px-3 py-2 text-foreground'
				/>
			</div>

			{/* Tag Filters */}
			{allTags.length > 0 && (
				<div>
					<p className='mb-2 text-sm font-semibold text-foreground'>Tags</p>
					<div className='flex flex-wrap gap-2'>
						{allTags.map((tag) => (
							<button
								key={tag}
								onClick={() => toggleTag(tag)}
								className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
									selectedTags.includes(tag)
										? 'bg-orange-600 text-white'
										: 'border border-orange-200 bg-orange-50 text-foreground hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:hover:bg-orange-900'
								}`}
							>
								{tag}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Ingredient Filters */}
			{allIngredients.length > 0 && (
				<div>
					<p className='mb-2 text-sm font-semibold text-foreground'>
						Ingredients
					</p>
					<div className='flex flex-wrap gap-2'>
						{allIngredients.map((ingredient) => (
							<button
								key={ingredient}
								onClick={() => toggleIngredient(ingredient)}
								className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
									selectedIngredients.includes(ingredient)
										? 'bg-orange-600 text-white'
										: 'border border-orange-200 bg-orange-50 text-foreground hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:hover:bg-orange-900'
								}`}
							>
								{ingredient}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Active Filters Summary */}
			{(searchText || selectedTags.length > 0 || selectedIngredients.length > 0) && (
				<div className='text-xs text-muted-foreground'>
					{selectedTags.length > 0 && `${selectedTags.length} tag(s) • `}
					{selectedIngredients.length > 0 &&
						`${selectedIngredients.length} ingredient(s) • `}
					Showing {recipes.length} total
				</div>
			)}
		</div>
	)
}
