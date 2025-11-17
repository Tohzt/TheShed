import * as React from 'react'
import Footer from '../../components/Footer'
import AnimatedButtonList from '../../components/AnimatedButtonList'

interface ButtonItem {
	label: string
	path: string
	style?: string
	type?: 'internal' | 'external'
	disabled?: boolean
}

const socialButtons: ButtonItem[] = [
	{
		label: 'Personal Instagram',
		path: 'https://www.instagram.com/im_just.a.me',
		type: 'external',
	},
	{
		label: 'Tattoo Instagram',
		path: 'https://www.instagram.com/tat.tohzt',
		type: 'external',
	},
	{
		label: 'Personal YouTube',
		path: 'https://www.youtube.com/c/godsautobiography',
		type: 'external',
	},
	{
		label: 'LetsClone YouTube',
		path: 'https://www.youtube.com/c/letsclone',
		type: 'external',
	},
	{
		label: 'Back',
		path: '/',
		type: 'internal',
	},
]

const SocialsPage = () => {
	return (
		<main className='min-h-screen overflow-x-hidden bg-background'>
			<div className='screen -center flex-col justify-start'>
				<div className='w-full flex-col gap-4 overflow-y-auto overflow-x-hidden pt-20'>
					<AnimatedButtonList
						buttons={socialButtons}
						staggerDelay={150}
						animationDuration={400}
					/>
				</div>
			</div>
		</main>
	)
}

export default SocialsPage
