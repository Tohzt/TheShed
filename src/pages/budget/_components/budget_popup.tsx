import React, {useEffect, useRef} from 'react'

interface BudgetPopupProps {
	isOpen: boolean
	onClose: () => void
	title: string | React.ReactNode
	children: React.ReactNode
}

export default function BudgetPopup({
	isOpen,
	onClose,
	title,
	children,
}: BudgetPopupProps) {
	const popupRef = useRef<HTMLDivElement>(null)

	// Close on escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose()
			}
		}

		if (isOpen) {
			document.addEventListener('keydown', handleEscape)
			document.body.style.overflow = 'hidden'
		}

		return () => {
			document.removeEventListener('keydown', handleEscape)
			document.body.style.overflow = 'unset'
		}
	}, [isOpen, onClose])

	// Close on backdrop click
	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose()
		}
	}

	if (!isOpen) return null

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm dark:bg-black/70'
			onClick={handleBackdropClick}
		>
			<div
				ref={popupRef}
				className='relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl dark:border-border/50 dark:bg-[#1a1a1a]'
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close Button */}
				<button
					onClick={onClose}
					className='absolute right-4 top-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
					aria-label='Close'
				>
					<svg
						className='h-6 w-6'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M6 18L18 6M6 6l12 12'
						/>
					</svg>
				</button>

				{/* Title */}
				<h3 className='mb-2 pr-8 text-2xl font-bold text-foreground'>
					{title}
				</h3>

				{/* Content */}
				{children}
			</div>
		</div>
	)
}

// Prevent Next.js from treating this as a page
export async function getServerSideProps() {
	return {
		notFound: true,
	}
}
