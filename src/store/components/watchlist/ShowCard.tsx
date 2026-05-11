import type { Show } from '../../../features/watchlist/types'

interface ShowCardProps {
	show: Show
	onEdit: (show: Show) => void
	onDelete: (id: string) => void
}

const getStatusBadgeColor = (status: string) => {
	switch (status) {
		case 'completed':
			return 'bg-green-500/20 text-green-700 dark:text-green-400'
		case 'caught-up':
			return 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
		case 'watching':
			return 'bg-rose-500/20 text-rose-700 dark:text-rose-400'
		case 'not-started':
			return 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
		case 'dropped':
			return 'bg-red-500/20 text-red-700 dark:text-red-400'
		default:
			return 'bg-rose-500/20 text-rose-700 dark:text-rose-400'
	}
}

const formatReleaseDate = (dateString?: string) => {
	if (!dateString) return 'TBA'
	const date = new Date(dateString)
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

const getStatusLabel = (status: string): string => {
	switch (status) {
		case 'not-started':
			return 'Not Started'
		case 'watching':
			return 'Watching'
		case 'caught-up':
			return 'Caught Up'
		case 'completed':
			return 'Completed'
		case 'dropped':
			return 'Dropped'
		default:
			return 'Unknown'
	}
}

export const ShowCard = ({ show, onEdit, onDelete }: ShowCardProps) => {
	const episodeProgress = show.currentSeason && show.currentEpisode
		? `S${show.currentSeason}E${show.currentEpisode}`
		: null

	return (
		<div className='rounded-lg border border-rose-300 bg-card p-4 dark:border-rose-700'>
			{show.posterUrl && (
				<img
					src={show.posterUrl}
					alt={show.title}
					className='mb-3 h-48 w-full rounded-md object-cover'
				/>
			)}
			<h3 className='mb-2 font-semibold text-foreground'>{show.title}</h3>

			<div className='mb-3 flex flex-wrap gap-2'>
				<span
					className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(
						show.status ?? 'watching'
					)}`}
				>
					{getStatusLabel(show.status ?? 'watching')}
				</span>
				{episodeProgress && (
					<span className='inline-block rounded-full bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-400'>
						{episodeProgress}
					</span>
				)}
			</div>

			{/* Progress Info */}
			{show.totalSeasonsTracked && show.episodesPerSeason && (
				<div className='mb-3 rounded bg-muted p-2 text-sm'>
					<p className='text-muted-foreground'>Series Structure</p>
					<p className='font-medium text-foreground'>
						{show.totalSeasonsTracked} seasons × {show.episodesPerSeason} episodes
					</p>
				</div>
			)}

			{/* Next Release Info */}
			{(show.nextEpisodeReleaseDate || show.nextSeasonReleaseDate) && (
				<div className='mb-3 space-y-2'>
					{show.nextEpisodeReleaseDate && (
						<div className='rounded bg-muted p-2 text-sm'>
							<p className='text-muted-foreground'>Next Episode</p>
							<p className='font-medium text-foreground'>
								{formatReleaseDate(show.nextEpisodeReleaseDate)}
							</p>
						</div>
					)}
					{show.nextSeasonReleaseDate && (
						<div className='rounded bg-muted p-2 text-sm'>
							<p className='text-muted-foreground'>
								Season {show.nextSeasonNumber || '?'} Release
							</p>
							<p className='font-medium text-foreground'>
								{formatReleaseDate(show.nextSeasonReleaseDate)}
							</p>
						</div>
					)}
				</div>
			)}

			{show.notes && (
				<p className='mb-3 text-sm text-muted-foreground'>{show.notes}</p>
			)}

			<div className='flex gap-2'>
				<button
					onClick={() => onEdit(show)}
					className='flex-1 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700'
				>
					Edit
				</button>
				<button
					onClick={() => onDelete(show.id)}
					className='flex-1 rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-accent'
				>
					Delete
				</button>
			</div>
		</div>
	)
}
