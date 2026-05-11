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
		case 'on-hold':
			return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
		case 'watching':
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

export const ShowCard = ({ show, onEdit, onDelete }: ShowCardProps) => {
	return (
		<div className='rounded-lg border border-rose-300 bg-card p-4 dark:border-rose-700'>
			{show.imageUrl && (
				<img
					src={show.imageUrl}
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
					{show.status ?? 'watching'}
				</span>
				{show.nextSeasonNumber && (
					<span className='inline-block rounded-full bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-700 dark:text-rose-400'>
						Season {show.nextSeasonNumber}
					</span>
				)}
			</div>

			{show.nextSeasonReleaseDate && (
				<div className='mb-3 rounded bg-muted p-2 text-sm'>
					<p className='text-muted-foreground'>Next Release:</p>
					<p className='font-medium text-foreground'>
						{formatReleaseDate(show.nextSeasonReleaseDate)}
					</p>
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
