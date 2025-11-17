import React, {useState} from 'react'
import {motion, AnimatePresence} from 'framer-motion'
import {Sun, Moon, ArrowLeft} from 'lucide-react'
import {useStore} from '@root-store/store'
import {Switch} from '@store/components/ui/switch'
import {useRouter} from 'next/router'
import {useHeaderDrawer} from '../contexts/HeaderDrawerContext'

interface HeaderProps {
	colorClass?: string
	colorHex?: string
}

const Header: React.FC<HeaderProps> = ({colorHex}) => {
	const color = colorHex || '#00b0ff'
	const transition = {duration: 0.5}
	const darkMode = useStore((state) => state.dark_mode)
	const toggleDarkMode = useStore((state) => state.toggle_dark_mode)
	const router = useRouter()
	const path = router.pathname
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [isBackButtonPressed, setIsBackButtonPressed] = useState(false)
	const [isTransitioning, setIsTransitioning] = useState(false)
	const {drawerContent} = useHeaderDrawer()

	const handleToggle = (checked: boolean) => {
		toggleDarkMode(checked)
	}

	const handleTextClick = () => {
		setIsDrawerOpen(!isDrawerOpen)
	}

	const handleBackToShed = async () => {
		if (isTransitioning) return
		setIsTransitioning(true)

		// Button press animation
		setIsBackButtonPressed(true)
		await new Promise((resolve) => setTimeout(resolve, 100))
		setIsBackButtonPressed(false)
		await new Promise((resolve) => setTimeout(resolve, 100))

		// Start drawer closing and button animations simultaneously
		const drawerAnimationDuration = 300
		const buttonAnimationDuration = 400

		// Close drawer
		setIsDrawerOpen(false)

		// Animate out any AnimatedButtonList buttons on the page
		const buttonElements = document.querySelectorAll('[data-button-index]')
		if (buttonElements.length > 0) {
			buttonElements.forEach((button) => {
				const index = parseInt(button.getAttribute('data-button-index') || '0')
				// Remove translate-x-0 class
				button.classList.remove('translate-x-0')
				// Add slide-out class based on button index (even = right, odd = left)
				if (index % 2 === 0) {
					button.classList.add('translate-x-full')
					button.classList.remove('-translate-x-full')
				} else {
					button.classList.add('-translate-x-full')
					button.classList.remove('translate-x-full')
				}
			})
		}

		// Wait for the longer animation to complete
		const maxDuration = Math.max(
			drawerAnimationDuration,
			buttonAnimationDuration
		)
		await new Promise((resolve) => setTimeout(resolve, maxDuration))

		// Navigate
		await router.push('/')
		setIsTransitioning(false)
	}

	return (
		<div className='fixed left-0 right-0 top-0 z-50 w-[100vw]'>
			<AnimatePresence>
				{isDrawerOpen && (
					<motion.div
						className='header-drawer'
						initial={{height: 0, opacity: 1}}
						animate={{height: 'auto', opacity: 1}}
						exit={{height: 0, opacity: 1}}
						transition={{duration: 0.3, ease: 'easeInOut'}}
					>
						<motion.div
							className='header-drawer-content'
							initial={{backgroundColor: color}}
							animate={{backgroundColor: color}}
							transition={transition}
						>
							{path !== '/' && (
								<button
									onClick={() => {
										void handleBackToShed()
									}}
									className={`header-drawer-button ${
										isBackButtonPressed ? 'header-drawer-button-pressed' : ''
									}`}
									disabled={isTransitioning}
								>
									<ArrowLeft className='h-5 w-5' />
									<span>Back to The Shed</span>
								</button>
							)}
							{drawerContent}
							<div className='flex items-center gap-3'>
								<Sun className='h-5 w-5 text-white' />
								<Switch
									checked={darkMode}
									onCheckedChange={handleToggle}
									aria-label='Toggle dark mode'
								/>
								<Moon className='h-5 w-5 text-white' />
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
			<div className='relative'>
				<motion.div
					className='header-profile-rectangle relative w-full'
					animate={{backgroundColor: color}}
					transition={transition}
				></motion.div>
				<motion.div
					className='header-text-container cursor-pointer'
					animate={{backgroundColor: color}}
					transition={transition}
					onClick={handleTextClick}
				>
					<span className='header-text'>
						{path === '/' ? 'THE SHED' : 'THE ' + path.slice(1).toUpperCase()}
					</span>
				</motion.div>
			</div>
		</div>
	)
}
export default Header
