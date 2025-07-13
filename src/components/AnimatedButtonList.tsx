import React, {useState, useEffect} from 'react'
import {useRouter} from 'next/router'
import {getRubricColor} from '../utils/colorRubric'

interface ButtonItem {
	label: string
	path: string
	style?: string
	type?: 'internal' | 'external'
	onClick?: () => void
	disabled?: boolean
}

interface AnimatedButtonListProps {
	buttons: ButtonItem[]
	onButtonClick?: (button: ButtonItem, index: number) => void
	onTransitionStart?: () => void
	onTransitionEnd?: () => void
	className?: string
	staggerDelay?: number
	animationDuration?: number
}

const AnimatedButtonList: React.FC<AnimatedButtonListProps> = ({
	buttons,
	onButtonClick,
	onTransitionStart,
	onTransitionEnd,
	className = '',
	animationDuration = 200,
}) => {
	const [pressedIndex, setPressedIndex] = useState<number | null>(null)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const [buttonStates, setButtonStates] = useState<boolean[]>(
		buttons.map(() => false)
	)
	const router = useRouter()

	// Initialize button states on mount
	useEffect(() => {
		const timer = setTimeout(() => {
			setButtonStates(buttons.map(() => true))
		}, 100)
		return () => clearTimeout(timer)
	}, [buttons])

	const handleButtonClick = async (button: ButtonItem, index: number) => {
		// Don't do anything if transitioning
		if (isTransitioning) return

		// Handle disabled buttons with shake animation
		if (button.disabled) {
			// Trigger shake animation by temporarily adding shake class
			const buttonElement = document.querySelector(
				`[data-button-index="${index}"]`
			)
			if (buttonElement) {
				const shakeDirection =
					index % 2 === 0 ? 'button-shake-right' : 'button-shake-left'
				buttonElement.classList.add(shakeDirection)

				// Remove shake class after animation completes
				setTimeout(() => {
					buttonElement.classList.remove(shakeDirection)
				}, 300)
			}
			return
		}

		setIsTransitioning(true)
		setPressedIndex(index)

		// Call custom onClick if provided
		if (onButtonClick) {
			onButtonClick(button, index)
		}

		// Trigger transition start callback
		if (onTransitionStart) {
			onTransitionStart()
		}

		// Wait for button press effect (hold at bottom)
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Release button
		setPressedIndex(null)

		// Wait for button to return to default (wait for border animation to complete)
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Check if this button should trigger a page transition animation
		const buttonColors = getButtonColor(button)
		const shouldAnimatePageTransition =
			buttonColors.shouldAnimatePageTransition ?? true

		if (shouldAnimatePageTransition) {
			// Animate all buttons sliding out at the same time
			setButtonStates(buttons.map(() => false))

			// Wait for slide out animation
			await new Promise((resolve) => setTimeout(resolve, animationDuration))

			// Navigate to new page
			if (button.type === 'external') {
				window.open(button.path, '_blank')
			} else {
				await router.push(button.path)
			}
		} else {
			// For external links that shouldn't animate page transition, just open the link
			if (button.type === 'external') {
				window.open(button.path, '_blank')
			} else {
				await router.push(button.path)
			}
		}

		// Reset states
		setIsTransitioning(false)

		if (onTransitionEnd) {
			onTransitionEnd()
		}
	}

	const getButtonColor = (button: ButtonItem) => {
		// Special handling for specific buttons
		if (button.label === 'Back') {
			return getRubricColor('back')
		}

		if (button.label === 'Personal Instagram') {
			return getRubricColor('personal-instagram')
		}

		if (button.label === 'Tattoo Instagram') {
			return getRubricColor('tattoo-instagram')
		}

		if (button.label === 'Personal YouTube') {
			return getRubricColor('personal-youtube')
		}

		if (button.label === 'LetsClone YouTube') {
			return getRubricColor('letsclone-youtube')
		}

		if (button.type === 'external') {
			// Other external links get a neutral color with no page transition
			return {
				primary: 'bg-gray-600',
				secondary: 'bg-gray-700',
				text: 'text-white',
				shouldAnimatePageTransition: false,
			}
		}

		// Get color based on destination page
		const destinationPage = button.path === '/' ? 'home' : button.path.slice(1)
		return getRubricColor(destinationPage)
	}

	const getButtonStyle = (
		button: ButtonItem,
		index: number,
		isVisible: boolean
	) => {
		const baseStyle = 'page-button'
		const offsetStyle = index % 2 === 0 ? ' offset-left' : ' offset-right'
		const buttonColors = getButtonColor(button)
		const colorStyle =
			index % 2 === 0 ? buttonColors.secondary : buttonColors.primary

		// Handle disabled state - disabled buttons have equal borders and no press animation
		const pressStyle = button.disabled
			? ' button-disabled'
			: pressedIndex === index
			? ' button-pressed'
			: ' button-default'

		// Slide direction based on button orientation (flipped)
		const slideDirection = index % 2 === 0 ? 'right' : 'left'
		const visibilityStyle = isVisible
			? ' translate-x-0'
			: slideDirection === 'left'
			? ' -translate-x-full'
			: ' translate-x-full'

		return `${baseStyle}${offsetStyle} ${colorStyle}${pressStyle}${visibilityStyle} ${className}`
	}

	return (
		<div className='flex flex-col gap-4 overflow-x-hidden'>
			{buttons.map((button, index) => (
				<div
					key={`${button.label}-${index}`}
					data-button-index={index}
					className={getButtonStyle(button, index, buttonStates[index])}
					style={{
						transition: `all ${animationDuration}ms ease-out ${
							buttonStates[index] ? index * 25 : 0
						}ms`,
					}}
					onClick={() => {
						void handleButtonClick(button, index)
					}}
				>
					<div className='pointer-events-none w-[80%] text-center'>
						{button.label}
					</div>
				</div>
			))}
		</div>
	)
}

export default AnimatedButtonList
