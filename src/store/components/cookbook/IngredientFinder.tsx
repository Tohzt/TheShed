import * as React from 'react'
import Image from 'next/image'
import type { Recipe } from '../../../features/cookbook/types'

interface IngredientFinderProps {
	recipes: Recipe[]
	onClose: () => void
}

export const IngredientFinder: React.FC<IngredientFinderProps> = ({
	recipes,
	onClose,
}) => {
	const [selectedIngredients, setSelectedIngredients] = React.useState<string[]>([])

	const allIngredients = React.useMemo(() => {
		const ingredients = new Set<string>()
		recipes.forEach((recipe) => {
			recipe.ingredients?.forEach((ingredient) => ingredients.add(ingredient))
		})
		return Array.from(ingredients).sort()
	}, [recipes])

	const matchingRecipes = React.useMemo(() => {
		if (selectedIngredients.length === 0) {
			return []
		}
		return recipes.filter((recipe) =>
			selectedIngredients.some((ingredient) =>
				recipe.ingredients?.includes(ingredient)
			)
		)
	}, [recipes, selectedIngredients])

	const toggleIngredient = (ingredient: string) => {
		setSelectedIngredients((prev) =>
			prev.includes(ingredient)
				? prev.filter((i) => i !== ingredient)
				: [...prev, ingredient]
		)
	}

	const clearSelection = () => {
		setSelectedIngredients([])
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
			<div className='relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-card p-6 shadow-lg'>
				<button
					onClick={onClose}
					className='absolute right-4 top-4 text-muted-foreground hover:text-foreground'
				>
					✕
				</button>

				<h2 className='mb-2 text-2xl font-bold text-foreground'>
					Find Recipes by Ingredient
				</h2>
				<p className='mb-4 text-sm text-muted-foreground'>
					Select ingredients to find recipes that include them.
				</p>

				{/* Ingredient Selection */}
				<div className='mb-6 rounded-lg border border-border bg-background p-4'>
					<p className='mb-3 text-sm font-semibold text-foreground'>
						Available Ingredients ({allIngredients.length})
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

				{/* Selected Ingredients Summary */}
				{selectedIngredients.length > 0 && (
					<div className='mb-4 flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950'>
						<span className='text-sm font-medium text-foreground'>
							{selectedIngredients.length} ingredient{selectedIngredients.length !== 1 ? 's' : ''} selected
						</span>
						<button
							onClick={clearSelection}
							className='text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300'
						>
							Clear all
						</button>
					</div>
				)}

				{/* Results */}
				{selectedIngredients.length > 0 && (
					<div>
						<h3 className='mb-3 text-lg font-semibold text-foreground'>
							Matching Recipes ({matchingRecipes.length})
						</h3>
						{matchingRecipes.length === 0 ? (
							<p className='rounded-lg border border-border bg-background p-4 text-center text-muted-foreground'>
								No recipes found with the selected ingredients.
							</p>
						) : (
							<div className='space-y-2 max-h-[40vh] overflow-y-auto'>
								{matchingRecipes.map((recipe) => (
									<div
										key={recipe.id}
										className='rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950'
									>
										<div className='flex items-start gap-3'>
											{recipe.imageUrl && (
												<Image
													src={recipe.imageUrl}
													alt={recipe.title}
													className='h-16 w-16 rounded object-cover'
												 />
											)}
											<div className='flex-1'>
												<h4 className='font-semibold text-foreground'>
													{recipe.title}
												</h4>
												{recipe.ingredients && (
													<p className='mt-1 text-xs text-muted-foreground'>
														Ingredients: {recipe.ingredients.join(', ')}
													</p>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Empty State */}
				{selectedIngredients.length === 0 && (
					<div className='rounded-lg border border-dashed border-border bg-background p-8 text-center'>
						<p className='text-muted-foreground'>
							Select ingredients above to find recipes.
						</p>
					</div>
				)}

				{/* Close Button */}
				<div className='mt-6 flex gap-2'>
					<button
						onClick={onClose}
						className='flex-1 rounded-md border border-border bg-muted px-4 py-2 font-medium text-foreground hover:bg-accent'
					>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}
