import {useEffect, useRef} from 'react'

interface BudgetPopupProps {
	isOpen: boolean
	onClose: () => void
	title: string
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
			className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'
			onClick={handleBackdropClick}
		>
			<div
				ref={popupRef}
				className='relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl'
				onClick={(e) => e.stopPropagation()}
			>
				{/* Close Button */}
				<button
					onClick={onClose}
					className='absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
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
				<h3 className='mb-6 pr-8 text-2xl font-bold text-gray-800'>{title}</h3>

				{/* Content */}
				{children}
			</div>
		</div>
	)
}
