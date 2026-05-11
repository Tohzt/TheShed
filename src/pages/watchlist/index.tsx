import * as React from 'react'
import Footer from '../../components/Footer'
import { watchListRepository } from '../../features/watchlist/repository'
import type { Show, ShowStatus } from '../../features/watchlist/types'
import { ShowCard } from '../../store/components/watchlist/ShowCard'
import { DatePicker } from '../../store/components/ui/DatePicker'

const getExportFilename = () => {
	const stamp = new Date().toISOString().replace(/[:.]/g, '-')
	return `watchlist-backup-${stamp}.json`
}

const WatchListPage = () => {
	const [shows, setShows] = React.useState<Show[]>([])
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<string | null>(null)
	const [formError, setFormError] = React.useState<string | null>(null)
	const [showForm, setShowForm] = React.useState(false)
	const [editingShow, setEditingShow] = React.useState<Show | null>(null)

	const [title, setTitle] = React.useState('')
	const [status, setStatus] = React.useState<ShowStatus>('not-started')
	const [currentSeason, setCurrentSeason] = React.useState('')
	const [currentEpisode, setCurrentEpisode] = React.useState('')
	const [totalSeasonsTracked, setTotalSeasonsTracked] = React.useState('')
	const [episodesPerSeason, setEpisodesPerSeason] = React.useState('')
	const [nextSeasonNumber, setNextSeasonNumber] = React.useState('')
	const [nextSeasonReleaseDate, setNextSeasonReleaseDate] = React.useState<string>()
	const [nextEpisodeReleaseDate, setNextEpisodeReleaseDate] = React.useState<string>()
	const [notes, setNotes] = React.useState('')
	const [posterUrl, setPosterUrl] = React.useState('')
	const importInputRef = React.useRef<HTMLInputElement | null>(null)

	const refreshShows = React.useCallback(() => {
		try {
			setError(null)
			const nextShows = watchListRepository.list()
			setShows(nextShows)
		} catch (repositoryError) {
			setError(
				repositoryError instanceof Error
					? repositoryError.message
					: 'Failed to load watch list data.'
			)
		} finally {
			setLoading(false)
		}
	}, [])

	React.useEffect(() => {
		refreshShows()
	}, [refreshShows])

	const resetForm = () => {
		setTitle('')
		setStatus('not-started')
		setCurrentSeason('')
		setCurrentEpisode('')
		setTotalSeasonsTracked('')
		setEpisodesPerSeason('')
		setNextSeasonNumber('')
		setNextSeasonReleaseDate(undefined)
		setNextEpisodeReleaseDate(undefined)
		setNotes('')
		setPosterUrl('')
		setFormError(null)
		setShowForm(false)
		setEditingShow(null)
	}

	const onSubmit = (event: React.FormEvent) => {
		event.preventDefault()
		try {
			setFormError(null)

			const showData = {
				title,
				status,
				currentSeason: currentSeason ? parseInt(currentSeason, 10) : undefined,
				currentEpisode: currentEpisode ? parseInt(currentEpisode, 10) : undefined,
				totalSeasonsTracked: totalSeasonsTracked ? parseInt(totalSeasonsTracked, 10) : undefined,
				episodesPerSeason: episodesPerSeason ? parseInt(episodesPerSeason, 10) : undefined,
				nextSeasonNumber: nextSeasonNumber ? parseInt(nextSeasonNumber, 10) : undefined,
				nextSeasonReleaseDate: nextSeasonReleaseDate || undefined,
				nextEpisodeReleaseDate: nextEpisodeReleaseDate || undefined,
				notes: notes || undefined,
				posterUrl: posterUrl || undefined,
			}

			if (editingShow) {
				watchListRepository.update(editingShow.id, showData)
			} else {
				watchListRepository.create(showData)
			}

			resetForm()
			refreshShows()
		} catch (submitError) {
			setFormError(
				submitError instanceof Error
					? submitError.message
					: 'Failed to save show.'
			)
		}
	}

	const onEdit = (show: Show) => {
		setEditingShow(show)
		setTitle(show.title)
		setStatus(show.status)
		setCurrentSeason(show.currentSeason?.toString() ?? '')
		setCurrentEpisode(show.currentEpisode?.toString() ?? '')
		setTotalSeasonsTracked(show.totalSeasonsTracked?.toString() ?? '')
		setEpisodesPerSeason(show.episodesPerSeason?.toString() ?? '')
		setNextSeasonNumber(show.nextSeasonNumber?.toString() ?? '')
		setNextSeasonReleaseDate(show.nextSeasonReleaseDate)
		setNextEpisodeReleaseDate(show.nextEpisodeReleaseDate)
		setNotes(show.notes ?? '')
		setPosterUrl(show.posterUrl ?? '')
		setShowForm(true)
	}

	const onDelete = (id: string) => {
		if (confirm('Are you sure you want to delete this show?')) {
			try {
				setError(null)
				watchListRepository.remove(id)
				refreshShows()
			} catch (deleteError) {
				setError(
					deleteError instanceof Error
						? deleteError.message
						: 'Failed to delete show.'
				)
			}
		}
	}

	const onExport = () => {
		try {
			setError(null)
			const payload = watchListRepository.exportData()
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
					: 'Failed to export watch list backup.'
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
			watchListRepository.importData(payload)
			refreshShows()
		} catch (importError) {
			setError(
				importError instanceof Error
					? importError.message
					: 'Failed to import watch list backup.'
			)
		} finally {
			event.target.value = ''
		}
	}

	return (
		<main className='min-h-screen overflow-x-hidden bg-background'>
			<div className='mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-28 pt-28'>
				{/* Header */}
				<section className='rounded-xl border-2 border-rose-600 bg-gradient-to-r from-rose-50 to-rose-100 p-4 dark:from-rose-950 dark:to-rose-900'>
					<h1 className='text-2xl font-bold text-foreground'>Watch List</h1>
					<p className='mt-1 text-sm text-muted-foreground'>
						Track your favorite shows, episodes, and upcoming releases.
					</p>
				</section>

				{/* Action Buttons */}
				<div className='flex flex-wrap gap-2'>
					<button
						type='button'
						onClick={() => setShowForm(!showForm)}
						className='rounded-md bg-rose-600 px-4 py-2 font-medium text-white hover:bg-rose-700'
					>
						➕ Add Show
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

				{/* Add/Edit Show Form */}
				{showForm && (
					<section className='rounded-xl border border-rose-500 bg-card p-4'>
						<div className='mb-4 flex items-center justify-between'>
							<h2 className='text-lg font-semibold text-foreground'>
								{editingShow ? 'Edit Show' : 'Add New Show'}
							</h2>
							<button
								onClick={() => resetForm()}
								className='text-muted-foreground hover:text-foreground'
							>
								✕
							</button>
						</div>
						<form className='flex flex-col gap-3' onSubmit={onSubmit}>
							{/* Basic Info */}
							<input
								value={title}
								onChange={(event) => setTitle(event.target.value)}
								placeholder='Show name (required)'
								className='rounded-md border border-border bg-background px-3 py-2 text-foreground'
								required
							/>

							<select
								value={status}
								onChange={(event) => setStatus(event.target.value as ShowStatus)}
								className='rounded-md border border-border bg-background px-3 py-2 text-foreground'
							>
								<option value='not-started'>Not Started</option>
								<option value='watching'>Watching</option>
								<option value='caught-up'>Caught Up</option>
								<option value='completed'>Completed</option>
								<option value='dropped'>Dropped</option>
							</select>

							{/* Episode & Season Tracking */}
							<div className='rounded-md border border-border/40 bg-muted/30 p-3'>
								<h3 className='mb-2 text-sm font-semibold text-foreground'>Episode & Season Tracking</h3>
								<div className='grid grid-cols-2 gap-2'>
									<input
										type='number'
										value={currentSeason}
										onChange={(event) => setCurrentSeason(event.target.value)}
										placeholder='Current Season'
										className='rounded-md border border-border bg-background px-3 py-2 text-foreground'
										min='0'
									/>
									<input
										type='number'
										value={currentEpisode}
										onChange={(event) => setCurrentEpisode(event.target.value)}
										placeholder='Current Episode'
										className='rounded-md border border-border bg-background px-3 py-2 text-foreground'
										min='0'
									/>
									<input
										type='number'
										value={totalSeasonsTracked}
										onChange={(event) => setTotalSeasonsTracked(event.target.value)}
										placeholder='Total Seasons'
										className='rounded-md border border-border bg-background px-3 py-2 text-foreground'
										min='1'
									/>
									<input
										type='number'
										value={episodesPerSeason}
										onChange={(event) => setEpisodesPerSeason(event.target.value)}
										placeholder='Episodes per Season'
										className='rounded-md border border-border bg-background px-3 py-2 text-foreground'
										min='1'
									/>
								</div>
								<p className='mt-2 text-xs text-muted-foreground'>
									Track which season and episode you've completed
								</p>
							</div>

							{/* Next Release Info */}
							<div className='rounded-md border border-border/40 bg-muted/30 p-3'>
								<h3 className='mb-2 text-sm font-semibold text-foreground'>Upcoming Releases</h3>
								<div className='flex flex-col gap-2'>
									<div className='grid grid-cols-2 gap-2'>
										<input
											type='number'
											value={nextSeasonNumber}
											onChange={(event) => setNextSeasonNumber(event.target.value)}
											placeholder='Next Season #'
											className='rounded-md border border-border bg-background px-3 py-2 text-foreground'
											min='1'
										/>
									</div>
									<DatePicker
										value={nextSeasonReleaseDate}
										onChange={setNextSeasonReleaseDate}
										placeholder='Next Season Release Date'
									/>
									<DatePicker
										value={nextEpisodeReleaseDate}
										onChange={setNextEpisodeReleaseDate}
										placeholder='Next Episode Release Date'
									/>
								</div>
								<p className='mt-2 text-xs text-muted-foreground'>
									When the next season or episode will be released
								</p>
							</div>

							<textarea
								value={notes}
								onChange={(event) => setNotes(event.target.value)}
								placeholder='Notes (optional)'
								className='min-h-[80px] rounded-md border border-border bg-background px-3 py-2 text-foreground'
							/>

							<input
								value={posterUrl}
								onChange={(event) => setPosterUrl(event.target.value)}
								placeholder='Poster Image URL (optional)'
								className='rounded-md border border-border bg-background px-3 py-2 text-foreground'
							/>

							{posterUrl && (
								<div className='relative'>
									<img
										src={posterUrl}
										alt='Preview'
										className='max-h-48 rounded-md'
										onError={() => setPosterUrl('')}
									/>
									<button
										type='button'
										onClick={() => setPosterUrl('')}
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
									className='flex-1 rounded-md bg-rose-600 px-4 py-2 font-medium text-white hover:bg-rose-700'
								>
									{editingShow ? 'Update' : 'Add'} Show
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

				{/* Shows Grid */}
				{loading ? (
					<div className='py-12 text-center'>
						<p className='text-muted-foreground'>Loading your watch list...</p>
					</div>
				) : shows.length === 0 ? (
					<div className='rounded-xl border border-border bg-card p-8 text-center'>
						<p className='text-lg text-muted-foreground'>
							📺 No shows yet. Start by adding your first show!
						</p>
					</div>
				) : (
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
						{shows.map((show) => (
							<ShowCard
								key={show.id}
								show={show}
								onEdit={onEdit}
								onDelete={onDelete}
							/>
						))}
					</div>
				)}
			</div>

			<Footer goBack={false} signIn={false} signOut={false} />
		</main>
	)
}

export default WatchListPage
