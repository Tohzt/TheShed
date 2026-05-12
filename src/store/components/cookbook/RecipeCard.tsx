import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Recipe } from '../../../features/cookbook/types'

interface RecipeCardProps {
	recipe: Recipe
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
	return (
		<Link href={`/cookbook/${recipe.id}`}>
			<div className='group relative overflow-hidden rounded-lg border-2 border-orange-600 bg-gradient-to-br from-orange-50 to-orange-100 shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg dark:from-orange-950 dark:to-orange-900'>
				{/* Card Inner Border (Pokedex Style) */}
				<div className='absolute inset-1 rounded-md border-2 border-orange-500/30 pointer-events-none'  />

				{/* Image Section */}
				{recipe.imageUrl ? (
					<div className='relative h-40 overflow-hidden bg-gradient-to-b from-orange-200 to-orange-100 dark:from-orange-800 dark:to-orange-700 flex items-center justify-center'>
						<Image
							src={recipe.imageUrl}
							alt={recipe.title}
							className='h-full w-full object-cover'
						 />
					</div>
				) : (
					<div className='relative h-40 bg-gradient-to-b from-orange-200 to-orange-100 dark:from-orange-800 dark:to-orange-700 flex items-center justify-center'>
						<span className='text-4xl'>🍳</span>
					</div>
				)}

				{/* Divider Line */}
				<div className='h-1 bg-orange-600'  />

				{/* Content Section */}
				<div className='p-3 relative z-10'>
					<h3 className='font-bold text-lg text-foreground line-clamp-2'>
						{recipe.title}
					</h3>

					{/* Tags */}
					{recipe.tags && recipe.tags.length > 0 && (
						<div className='mt-2 flex flex-wrap gap-1'>
							{recipe.tags.slice(0, 3).map((tag) => (
								<span
									key={tag}
									className='inline-block rounded-full bg-orange-600 px-2 py-1 text-xs font-semibold text-white dark:bg-orange-500'
								>
									{tag}
								</span>
							))}
							{recipe.tags.length > 3 && (
								<span className='inline-block text-xs text-muted-foreground'>
									+{recipe.tags.length - 3} more
								</span>
							)}
						</div>
					)}

					{/* Meta Info */}
					<div className='mt-2 text-xs text-muted-foreground'>
						<p>Updated {new Date(recipe.updatedAt).toLocaleDateString()}</p>
					</div>

					{/* Ingredients Preview */}
					{recipe.ingredients && recipe.ingredients.length > 0 && (
						<div className='mt-2 text-xs text-foreground'>
							<p className='font-semibold'>Ingredients:</p>
							<p className='text-muted-foreground line-clamp-1'>
								{recipe.ingredients.slice(0, 2).join(', ')}
								{recipe.ingredients.length > 2 && '...'}
							</p>
						</div>
					)}
				</div>
			</div>
		</Link>
	)
}
