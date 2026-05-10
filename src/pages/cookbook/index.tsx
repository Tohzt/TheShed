import * as React from 'react'
import Footer from '../../components/Footer'
import { cookbookRepository } from '../../features/cookbook/repository'
import type { Recipe } from '../../features/cookbook/types'
import { RecipeCard } from '../../store/components/cookbook/RecipeCard'
import { FoodScanner } from '../../store/components/cookbook/FoodScanner'
import { RecipeSearch } from '../../store/components/cookbook/RecipeSearch'
import { TagInput } from '../../store/components/cookbook/TagInput'

const getExportFilename = () => {
	const stamp = new Date().toISOString().replace(/[:.]/g, '-')
	return `cookbook-backup-${stamp}.json`
}

const CookbookPage = () => {
	const [recipes, setRecipes] = React.useState<Recipe[]>([])
	const [filteredRecipes, setFilteredRecipes] = React.useState<Recipe[]>([])
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [formError, setFormError] = React.useState<string | null>(null)
	const [showScanner, setShowScanner] = React.useState(false)
	const [showForm, setShowForm] = React.useState(false)
	const [title, setTitle] = React.useState('')
	const [sourceUrl, setSourceUrl] = React.useState('')
	const [note, setNote] = React.useState('')
	const [tags, setTags] = React.useState<string[]>([])
	const [ingredients, setIngredients] = React.useState<string[]>([])
	const [imageUrl, setImageUrl] = React.useState<string>('')
	const importInputRef = React.useRef<HTMLInputElement | null>(null)

	const refreshRecipes = React.useCallback(() => {
		try {
			setError(null)
			const nextRecipes = cookbookRepository.list()
			setRecipes(nextRecipes)
			setFilteredRecipes(nextRecipes)
		} catch (repositoryError) {
			setError(
				repositoryError instanceof Error
					? repositoryError.message
					: 'Failed to load cookbook data.'
			)
		} finally {
			setLoading(false)
		}
	}, [])

	React.useEffect(() => {
		refreshRecipes()
	}, [refreshRecipes])

	const resetForm = () => {
		setTitle('')
		setSourceUrl('')
		setNote('')
		setTags([])
		setIngredients([])
		setImageUrl('')
		setFormError(null)
		setShowForm(false)
	}

	const onSubmit = (event: React.FormEvent) => {
		event.preventDefault()
		try {
			setFormError(null)
			cookbookRepository.create({
				title,
				sourceUrl,
				note,
				tags: tags.length > 0 ? tags : undefined,
				ingredients: ingredients.length > 0 ? ingredients : undefined,
				imageUrl: imageUrl || undefined,
			})
			resetForm()
			refreshRecipes()
		} catch (submitError) {
			setFormError(
				submitError instanceof Error
					? submitError.message
					: 'Failed to create recipe.'
			)
		}
	}

	const onCapture = (imageData: string) => {
		setImageUrl(imageData)
		setShowScanner(false)
	}

	const onExport = () => {
		try {
			setError(null)
			const payload = cookbookRepository.exportData()
			const blob = new Blob([JSON.stringify(payload, null, 2)], {
				type: 'application/json',
			})
			const url = URL.createObjectURL(blob)
			const anchor = document.createElement('a')
			anchor.href = url
			anchor.download = getExportFilename()
			anchor.click()
			URL.revokeObjectURL(url)
		} catch (exportError) {
			setError(
				exportError instanceof Error
					? exportError.message
					: 'Failed to export cookbook backup.'
			)
		}
	}

	const onChooseImport = () => {
		importInputRef.current?.click()
	}

	const onImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0]
		if (!selectedFile) {
			return
		}

		try {
			setError(null)
			const text = await selectedFile.text()
			const payload = JSON.parse(text) as unknown
			cookbookRepository.importData(payload)
			refreshRecipes()
		} catch (importError) {
			setError(
				importError instanceof Error
					? importError.message
					: 'Failed to import cookbook backup.'
			)
		} finally {
			event.target.value = ''
		}
	}

	return (
		<main className='min-h-screen overflow-x-hidden bg-background'>
			<div className='mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-28 pt-28'>
				{/* Header */}
				<section className='rounded-xl border-2 border-orange-600 bg-gradient-to-r from-orange-50 to-orange-100 p-4 dark:from-orange-950 dark:to-orange-900'>
					<h1 className='text-3xl font-bold text-foreground'>🍱 Pokédex</h1>
					<p className='mt-1 text-sm text-muted-foreground'>
						Your personal recipe encyclopedia. Scan, search, and collect recipes.
					</p>
				</section>

				{/* Action Buttons */}
				<div className='flex flex-wrap gap-2'>
					<button
						type='button'
						onClick={() => setShowScanner(true)}
						className='rounded-md bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700'
					>
						📸 Scan Food
					</button>
					<button
						type='button'
						onClick={() => setShowForm(!showForm)}
						className='rounded-md bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700'
					>
						➕ Add Recipe
					</button>
					<button
						type='button'
						onClick={onExport}
						className='rounded-md border border-border bg-muted px-4 py-2 font-medium text-foreground hover:bg-accent'
					>
						💾 Export
					</button>
					<button
						type='button'
						onClick={onChooseImport}
						className='rounded-md border border-border bg-muted px-4 py-2 font-medium text-foreground hover:bg-accent'
					>
						📥 Import
					</button>
					<input
						ref={importInputRef}
						type='file'
						accept='application/json,.json'
						className='hidden'
						onChange={(event) => {
							void onImport(event)
						}}
					/>
				</div>

				{/* Add Recipe Form */}
				{showForm && (
					<section className='rounded-xl border border-orange-500 bg-card p-4'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='text-lg font-semibold text-foreground'>
								Add New Recipe
							</h2>
							<button
								onClick={() => resetForm()}
								className='text-muted-foreground hover:text-foreground'
							>
								✕
							</button>
						</div>
						<form className='flex flex-col gap-3' onSubmit={onSubmit}>
							<input
								value={title}
								onChange={(event) => setTitle(event.target.value)}
								placeholder='Recipe name (required)'
								className='rounded-md border border-border bg-background px-3 py-2 text-foreground'
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
								className='min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-foreground'
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

							{imageUrl && (
								<div className='relative'>
									<img
										src={imageUrl}
										alt='Preview'
										className='max-h-48 rounded-md'
									/>
									<button
										type='button'
										onClick={() => setImageUrl('')}
										className='absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700'
									>
										✕
									</button>
								</div>
							)}

							{formError && (
								<p className='rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive'>
									{formError}
								</p>
							)}

							<div className='flex gap-2'>
								<button
									type='submit'
									className='flex-1 rounded-md bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700'
								>
									Create Recipe
								</button>
								<button
									type='button'
									onClick={() => resetForm()}
									className='flex-1 rounded-md border border-border bg-muted px-4 py-2 font-medium text-foreground hover:bg-accent'
								>
									Cancel
								</button>
							</div>
						</form>
					</section>
				)}

				{error && (
					<section className='rounded-xl border border-destructive/40 bg-destructive/10 p-4'>
						<p className='text-sm text-destructive'>{error}</p>
					</section>
				)}

				{/* Search & Filter */}
				{!loading && recipes.length > 0 && (
					<RecipeSearch recipes={recipes} onFilterChange={setFilteredRecipes} />
				)}

				{/* Recipes Grid */}
				{loading ? (
					<div className='py-12 text-center'>
						<p className='text-muted-foreground'>Loading your recipe collection...</p>
					</div>
				) : filteredRecipes.length === 0 ? (
					<div className='rounded-xl border border-border bg-card p-8 text-center'>
						<p className='text-lg text-muted-foreground'>
							{recipes.length === 0
								? '📖 No recipes yet. Start by adding your first recipe!'
								: 'No recipes match your search. Try different filters.'}
						</p>
					</div>
				) : (
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{filteredRecipes.map((recipe) => (
							<RecipeCard key={recipe.id} recipe={recipe} />
						))}
					</div>
				)}
			</div>

			{showScanner && (
				<FoodScanner
					onCapture={onCapture}
					onClose={() => setShowScanner(false)}
				/>
			)}

			<Footer goBack={false} signIn={false} signOut={false} />
		</main>
	)
}

export default CookbookPage
