import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Footer from '../../components/Footer'
import { cookbookRepository } from '../../features/cookbook/repository'
import type { Recipe } from '../../features/cookbook/types'
import { TagInput } from '../../store/components/cookbook/TagInput'

const RecipeDetailPage = () => {
	const router = useRouter()
	const recipeId = typeof router.query.id === 'string' ? router.query.id : ''
	const [recipe, setRecipe] = React.useState<Recipe | null>(null)
	const [title, setTitle] = React.useState('')
	const [sourceUrl, setSourceUrl] = React.useState('')
	const [note, setNote] = React.useState('')
	const [tags, setTags] = React.useState<string[]>([])
	const [ingredients, setIngredients] = React.useState<string[]>([])
	const [imageUrl, setImageUrl] = React.useState('')
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)

	const hydrateRecipe = React.useCallback(() => {
		if (!recipeId) return

		try {
			setError(null)
			const nextRecipe = cookbookRepository.getById(recipeId)
			if (!nextRecipe) {
				setRecipe(null)
				setError('Recipe was not found.')
			} else {
				setRecipe(nextRecipe)
				setTitle(nextRecipe.title)
				setSourceUrl(nextRecipe.sourceUrl ?? '')
				setNote(nextRecipe.note ?? '')
				setTags(nextRecipe.tags ?? [])
				setIngredients(nextRecipe.ingredients ?? [])
				setImageUrl(nextRecipe.imageUrl ?? '')
			}
		} catch (hydrateError) {
			setError(
				hydrateError instanceof Error
					? hydrateError.message
					: 'Failed to load recipe.'
			)
		} finally {
			setLoading(false)
		}
	}, [recipeId])

	React.useEffect(() => {
		if (!router.isReady) return
		hydrateRecipe()
	}, [router.isReady, hydrateRecipe])

	const onSave = (event: React.FormEvent) => {
		event.preventDefault()
		if (!recipeId) return

		try {
			setError(null)
			const updated = cookbookRepository.update(recipeId, {
				title,
				sourceUrl,
				note,
				tags: tags.length > 0 ? tags : undefined,
				ingredients: ingredients.length > 0 ? ingredients : undefined,
				imageUrl: imageUrl || undefined,
			})
			setRecipe(updated)
		} catch (saveError) {
			setError(
				saveError instanceof Error ? saveError.message : 'Failed to save.'
			)
		}
	}

	const onDelete = async () => {
		if (!recipeId) return
		const shouldDelete = window.confirm('Delete this recipe?')
		if (!shouldDelete) return

		try {
			cookbookRepository.remove(recipeId)
			await router.push('/cookbook')
		} catch (removeError) {
			setError(
				removeError instanceof Error
					? removeError.message
					: 'Failed to delete recipe.'
			)
		}
	}

	return (
		<main className='min-h-screen overflow-x-hidden bg-background'>
			<div className='mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-28 pt-28'>
				<section className='rounded-xl border border-border bg-card p-4'>
					<Link
						href='/cookbook'
						className='text-sm font-medium text-orange-600 hover:text-orange-700'
					>
						← Back to Pokédex
					</Link>
					<h1 className='text-2xl font-bold text-foreground'>📖 Recipe Details</h1>
					<p className='mt-1 text-sm text-muted-foreground'>
						Edit your recipe and save your changes.
					</p>
				</section>

				{loading ? (
					<section className='rounded-xl border border-border bg-card p-4'>
						<p className='text-sm text-muted-foreground'>Loading recipe...</p>
					</section>
				) : !recipe ? (
					<section className='rounded-xl border border-border bg-card p-4'>
						<p className='text-sm text-muted-foreground'>
							Recipe not found. It may have been deleted.
						</p>
					</section>
				) : (
					<section className='rounded-xl border border-border bg-card p-4'>
						<form className='flex flex-col gap-4' onSubmit={onSave}>
							{imageUrl && (
								<div className='relative'>
									<img
										src={imageUrl}
										alt='Recipe'
										className='max-h-64 rounded-md w-full object-cover'
									/>
									<button
										type='button'
										onClick={() => setImageUrl('')}
										className='absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white hover:bg-red-700'
									>
										✕
									</button>
								</div>
							)}

							<input
								value={title}
								onChange={(event) => setTitle(event.target.value)}
								placeholder='Recipe title (required)'
								className='rounded-md border border-border bg-background px-3 py-2 text-foreground font-semibold text-lg'
								required
							/>

							<input
								value={sourceUrl}
								onChange={(event) => setSourceUrl(event.target.value)}
								placeholder='Source URL (optional)'
								className='rounded-md border border-border bg-background px-3 py-2 text-foreground'
							/>

							<textarea
								value={note}
								onChange={(event) => setNote(event.target.value)}
								placeholder='Instructions & notes (optional)'
								className='min-h-[120px] rounded-md border border-border bg-background px-3 py-2 text-foreground'
							/>

							<TagInput
								label='Tags'
								placeholder='e.g., Breakfast, Quick, Vegetarian'
								value={tags}
								onChange={setTags}
							/>

							<TagInput
								label='Ingredients'
								placeholder='e.g., Eggs, Cheese, Bread'
								value={ingredients}
								onChange={setIngredients}
							/>

							<div className='flex flex-wrap gap-2 pt-2'>
								<button
									type='submit'
									className='flex-1 rounded-md bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700'
								>
									Save Changes
								</button>
								<button
									type='button'
									onClick={() => {
										void onDelete()
									}}
									className='flex-1 rounded-md bg-destructive px-4 py-2 font-medium text-destructive-foreground hover:opacity-90'
								>
									Delete Recipe
								</button>
							</div>
						</form>

						<div className='mt-4 pt-4 border-t border-border'>
							<p className='text-xs text-muted-foreground'>
								Created {new Date(recipe.createdAt).toLocaleString()}
							</p>
							<p className='text-xs text-muted-foreground'>
								Last updated {new Date(recipe.updatedAt).toLocaleString()}
							</p>
						</div>
					</section>
				)}

				{error && (
					<section className='rounded-xl border border-destructive/40 bg-destructive/10 p-4'>
						<p className='text-sm text-destructive'>{error}</p>
					</section>
				)}
			</div>

			<Footer goBack={false} signIn={false} signOut={false} />
		</main>
	)
}

export default RecipeDetailPage
