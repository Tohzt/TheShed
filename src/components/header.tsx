import React from 'react'
import ProfileIcon from './ProfileIcon'
//import { useSession } from 'next-auth/react';
import {motion} from 'framer-motion'

interface HeaderProps {
	colorClass?: string
	colorHex?: string
}

const Header: React.FC<HeaderProps> = ({colorHex}) => {
	//const { data: session } = useSession();
	//const user = session ? session.user : null
	//const hello = api.example.hello.useQuery({ text: "from tRPC" });
	// const [width, setWidth] = React.useState<number>(900)

	// function handleWindowSizeChange() {
	// 	setWidth(window.innerWidth)
	// }
	// React.useEffect(() => {
	// 	window.addEventListener('resize', handleWindowSizeChange)
	// 	return () => {
	// 		window.removeEventListener('resize', handleWindowSizeChange)
	// 	}
	// }, [])

	// const isMobile = width <= 768

	// Framer Motion animation for color
	const color = colorHex || '#00b0ff'
	const transition = {duration: 0.5}

	return (
		<div className='fixed left-0 top-0 z-50 w-full'>
			<motion.div
				className='header-profile-container'
				animate={{backgroundColor: color}}
				transition={transition}
			/>
			<motion.div
				className='header-profile-square'
				animate={{backgroundColor: color}}
				transition={transition}
			/>
			<motion.div
				className='header-profile-gap'
				animate={{backgroundColor: color}}
				transition={transition}
			/>
			<div className='header-icon'></div>
			<div className='header-icon-inner'></div>
			<ProfileIcon />
			<motion.div
				className='header-profile-rectangle'
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
