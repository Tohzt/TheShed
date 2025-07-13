import {useState, useCallback} from 'react'

interface UsePageTransitionOptions {
	onTransitionStart?: () => void
	onTransitionEnd?: () => void
	animationDuration?: number
}

export const usePageTransition = (options: UsePageTransitionOptions = {}) => {
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [transitionDirection, setTransitionDirection] = useState<'in' | 'out'>(
		'in'
	)

	const startTransition = useCallback(
		async (direction: 'in' | 'out' = 'out') => {
			setIsTransitioning(true)
			setTransitionDirection(direction)

			if (options.onTransitionStart) {
				options.onTransitionStart()
			}

			if (direction === 'out') {
				// Wait for slide out animation
				await new Promise((resolve) =>
					setTimeout(resolve, options.animationDuration || 300)
				)
			}
		},
		[options]
	)

	const endTransition = useCallback(() => {
		setIsTransitioning(false)

		if (options.onTransitionEnd) {
			options.onTransitionEnd()
		}
	}, [options])

	const animateIn = useCallback(async () => {
		await startTransition('in')
		// Small delay for in animation
		await new Promise((resolve) =>
			setTimeout(resolve, options.animationDuration || 300)
		)
		endTransition()
	}, [startTransition, endTransition, options.animationDuration])

	return {
		isTransitioning,
		transitionDirection,
		startTransition,
		endTransition,
		animateIn,
	}
}
