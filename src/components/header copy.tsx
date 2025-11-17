import React from 'react'
import {motion} from 'framer-motion'
import {Sun, Moon} from 'lucide-react'
import {useStore} from '@root-store/store'
import {Switch} from '@store/components/ui/switch'

interface HeaderProps {
	colorClass?: string
	colorHex?: string
}

const Header: React.FC<HeaderProps> = ({colorHex}) => {
	const color = colorHex || '#00b0ff'
	const transition = {duration: 0.5}
	const darkMode = useStore((state) => state.dark_mode)
	const toggleDarkMode = useStore((state) => state.toggle_dark_mode)

	const handleToggle = (checked: boolean) => {
		toggleDarkMode(checked)
	}

	return (
		<div className='fixed right-0 top-0 z-50 w-[100vw]'>
			<motion.div
				className='header-profile-rectangle w-full'
				animate={{backgroundColor: color}}
				transition={transition}
			>
				<div className='relative w-full'>
					<motion.div
						className='header-text'
						animate={{backgroundColor: color}}
						transition={transition}
					>
						<div className='-center flex-col gap-1'>
							<span className='text-[3em] font-bold text-white'>The</span>
							<span className='-translate-x-2 text-[3em] font-bold text-white'>
								Shed
							</span>
						</div>
					</motion.div>
					<div className='absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-3'>
						<Sun className='h-5 w-5 text-white' />
						<Switch
							checked={darkMode}
							onCheckedChange={handleToggle}
							aria-label='Toggle dark mode'
						/>
						<Moon className='h-5 w-5 text-white' />
					</div>
				</div>
			</motion.div>
		</div>
	)
}
export default Header
