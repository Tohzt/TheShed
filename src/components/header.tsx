import React from 'react'
import ProfileIcon from './ProfileIcon'
//import { useSession } from 'next-auth/react';
import {api} from '../utils/api'

interface HeaderProps {
	colorClass?: string
}

const Header: React.FC<HeaderProps> = ({colorClass = 'bg-secondary'}) => {
	//const { data: session } = useSession();
	//const user = session ? session.user : null
	//const hello = api.example.hello.useQuery({ text: "from tRPC" });
	const [width, setWidth] = React.useState<number>(900)

	function handleWindowSizeChange() {
		setWidth(window.innerWidth)
	}
	React.useEffect(() => {
		window.addEventListener('resize', handleWindowSizeChange)
		return () => {
			window.removeEventListener('resize', handleWindowSizeChange)
		}
	}, [])

	const isMobile = width <= 768

	return (
		<div className=''>
			<div className={`header-profile-container ${colorClass}`}></div>
			<div className={`header-profile-square ${colorClass}`}></div>
			<div className={`header-profile-gap ${colorClass}`}></div>
			<div className='header-icon'></div>
			<div className='header-icon-inner'></div>
			<ProfileIcon />
			<div className={`header-profile-rectangle ${colorClass}`}>
				<div className='w-full'>
					<div className={`header-text ${colorClass}`}>
						<div className='-center flex-col gap-1'>
							<span className='text-[3em] font-bold text-white'>The</span>
							<span className='-translate-x-2 text-[3em] font-bold text-white'>
								Shed
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
export default Header
