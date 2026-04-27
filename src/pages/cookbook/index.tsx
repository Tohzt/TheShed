import * as React from 'react'
import Link from 'next/link'
import Footer from '../../components/Footer'
import {cookbookRepository} from '../../features/cookbook/repository'
import type {Recipe} from '../../features/cookbook/types'

const getExportFilename = () => {
	const stamp = new Date().toISOString().replace(/[:.]/g, '-')
	return `cookbook-backup-${stamp}.json`
}

const CookbookPage = () => {
	const [recipes, setRecipes] = React.useState<Recipe[]>([])
	const [title, setTitle] = React.useState('')
	const [sourceUrl, setSourceUrl] = React.useState('')
	const [note, setNote] = React.useState('')
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [formError, setFormError] = React.useState<string | null>(null)
	const importInputRef = React.useRef<HTMLInputElement | null>(null)

	const refreshRecipes = React.useCallback(() => {
		try {
			setError(null)
			const nextRecipes = cookbookRepository.list()
			setRecipes(nextRecipes)
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

	const onSubmit = (event: React.FormEvent) => {
		event.preventDefault()
		try {
			setFormError(null)
			cookbookRepository.create({
				title,
				sourceUrl,
				note,
			})
			setTitle('')
			setSourceUrl('')
			setNote('')
			refreshRecipes()
		} catch (submitError) {
			setFormError(
				submitError instanceof Error
					? submitError.message
					: 'Failed to create recipe.'
			)
		}
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
			<div className='mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-28 pt-28'>
				<section className='rounded-xl border border-border bg-card p-4'>
					<div className='flex flex-wrap gap-2'>
						<button
							type='button'
							onClick={onExport}
							className='rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground hover:bg-accent'
						>
							Export Backup
						</button>
						<button
							type='button'
							onClick={onChooseImport}
							className='rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground hover:bg-accent'
						>
							Import Backup
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
				</section>

				<section className='rounded-xl border border-border bg-card p-4'>
					<h2 className='text-lg font-medium text-foreground'>Quick Add</h2>
					<form className='mt-3 flex flex-col gap-3' onSubmit={onSubmit}>
						<input
							value={title}
							onChange={(event) => setTitle(event.target.value)}
							placeholder='Recipe title (required)'
							className='rounded-md border border-border bg-background px-3 py-2 text-foreground'
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
							placeholder='Note (optional)'
							className='min-h-[88px] rounded-md border border-border bg-background px-3 py-2 text-foreground'
						/>
						{formError && (
							<p className='rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive'>
								{formError}
							</p>
						)}
						<button
							type='submit'
							className='rounded-md bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700'
						>
							Add Recipe
						</button>
					</form>
				</section>

				{error && (
					<section className='rounded-xl border border-destructive/40 bg-destructive/10 p-4'>
						<p className='text-sm text-destructive'>{error}</p>
					</section>
				)}

				<section className='rounded-xl border border-border bg-card p-4'>
					<h2 className='text-lg font-medium text-foreground'>Recipes</h2>
					{loading ? (
						<p className='mt-3 text-sm text-muted-foreground'>
							Loading recipes...
						</p>
					) : recipes.length === 0 ? (
						<p className='mt-3 text-sm text-muted-foreground'>
							No recipes yet. Add your first recipe above.
						</p>
					) : (
						<ul className='mt-3 flex flex-col gap-2'>
							{recipes.map((recipe) => (
								<li
									key={recipe.id}
									className='rounded-md border border-border bg-background px-3 py-2'
								>
									<Link href={`/cookbook/${recipe.id}`} className='block'>
										<div className='font-medium text-foreground'>
											{recipe.title}
										</div>
										<div className='text-xs text-muted-foreground'>
											Updated {new Date(recipe.updatedAt).toLocaleString()}
										</div>
									</Link>
								</li>
							))}
						</ul>
					)}
				</section>
			</div>

			<Footer goBack={false} signIn={false} signOut={false} />
		</main>
	)
}

export default CookbookPage
