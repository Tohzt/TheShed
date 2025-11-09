import React from 'react'
import {motion} from 'framer-motion'

interface HeaderProps {
	colorClass?: string
	colorHex?: string
}

const Header: React.FC<HeaderProps> = ({colorHex}) => {
	const color = colorHex || '#00b0ff'
	const transition = {duration: 0.5}

	return (
		<div className='fixed right-0 top-0 z-50 w-[100vw]'>
			<motion.div
				className='header-profile-rectangle w-full'
				animate={{backgroundColor: color}}
				transition={transition}
			>
				<div className='w-full'>
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
				</div>
			</motion.div>
		</div>
	)
}
export default Header
