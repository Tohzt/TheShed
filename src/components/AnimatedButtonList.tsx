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
	skipNavigation?: boolean
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

	useEffect(() => {
		const timer = setTimeout(() => {
			setButtonStates(buttons.map(() => true))
		}, 100)
		return () => clearTimeout(timer)
	}, [buttons])

	const handleButtonClick = async (button: ButtonItem, index: number) => {
		if (isTransitioning) return

		// Shake disabled buttons
		if (button.disabled) {
			const buttonElement = document.querySelector(
				`[data-button-index="${index}"]`
			)
			if (buttonElement) {
				const shakeDirection =
					index % 2 === 0 ? 'button-shake-right' : 'button-shake-left'
				buttonElement.classList.add(shakeDirection)

				setTimeout(() => {
					buttonElement.classList.remove(shakeDirection)
				}, 300)
			}
			return
		}

		setPressedIndex(index)
		setIsTransitioning(true)
		if (onTransitionStart) {
			onTransitionStart()
		}

		if (onButtonClick) {
			onButtonClick(button, index)
		}

		// Animate button press
		await new Promise((resolve) => setTimeout(resolve, 100))
		setPressedIndex(null)
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Skip navigation if button has skipNavigation flag
		if (button.skipNavigation) {
			setIsTransitioning(false)
			if (onTransitionEnd) {
				onTransitionEnd()
			}
			return
		}

		// Check if this button should trigger a page transition animation
		const buttonColors = getButtonColor(button)
		const shouldAnimatePageTransition =
			buttonColors.shouldAnimatePageTransition ?? true

		if (shouldAnimatePageTransition) {
			setButtonStates(buttons.map(() => false))
			await new Promise((resolve) => setTimeout(resolve, animationDuration))
			if (button.type === 'external') {
				window.open(button.path, '_blank')
			} else {
				await router.push(button.path)
			}
		} else {
			if (button.type === 'external') {
				window.open(button.path, '_blank')
			} else {
				await router.push(button.path)
			}
		}

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
				primaryHex: '#4b5563',
				secondary: 'bg-gray-700',
				background: 'bg-gradient-to-t from-primary-light to-primary-dark',
				borderColor: 'border-gray-500',
				textColor: 'text-gray-500',
				mutedBg: 'bg-gray-950/30',
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
		const offsetStyle =
			index % 2 === 0 ? ' offset-left border-r-0' : ' offset-right border-l-0'
		const buttonColors = getButtonColor(button)

		// Use border color and muted background
		// Apply border color to all sides (border- applies to all sides)
		const borderStyle = buttonColors.borderColor
		const bgStyle = buttonColors.mutedBg

		// Create hover classes that swap colors
		// Hover background: use border color (replace 'border-' with 'hover:bg-')
		const hoverBgStyle = buttonColors.borderColor.replace(
			'border-',
			'hover:bg-'
		)

		// Hover border: use muted background (replace 'bg-' with 'hover:border-')
		// Tailwind supports opacity in border colors: 'bg-blue-950/30' -> 'hover:border-blue-950/30'
		const hoverBorderStyle = buttonColors.mutedBg.replace(
			'bg-',
			'hover:border-'
		)

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

		return `${baseStyle}${offsetStyle} ${borderStyle} ${bgStyle} ${hoverBgStyle} ${hoverBorderStyle} group cursor-pointer ${pressStyle}${visibilityStyle} ${className}`
	}

	return (
		<div className='flex flex-col gap-4 overflow-x-hidden'>
			{buttons.map((button, index) => {
				const buttonColors = getButtonColor(button)
				return (
					<button
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
						<div
							className={`pointer-events-none w-[80%] text-center ${
								buttonColors.textColor
							} ${buttonColors.mutedBg.replace('bg-', 'group-hover:text-')}`}
						>
							{button.label}
						</div>
					</button>
				)
			})}
		</div>
	)
}

export default AnimatedButtonList
