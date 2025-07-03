import * as React from 'react'
import Header from '../../components/header'
import Footer from '../../components/Footer'
import AnimatedButtonList from '../../components/AnimatedButtonList'
import {usePageTransition} from '../../hooks/usePageTransition'
import {getRubricColor} from '../../utils/colorRubric'

interface ButtonItem {
	label: string
	path: string
	style?: string
	type?: 'internal' | 'external'
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
	const {isTransitioning} = usePageTransition({
		animationDuration: 400,
	})

	const [headerColor] = React.useState(getRubricColor('socials').primary)

	const handleButtonClick = (button: ButtonItem, index: number) => {
		console.log(`Clicked ${button.label} at index ${index}`)
	}

	const handleTransitionStart = () => {
		console.log('Transition starting...')
	}

	const handleTransitionEnd = () => {
		console.log('Transition ended')
	}

	return (
		true && (
			<>
				<main className='overflow-x-hidden bg-gradient-to-t from-primary-light to-primary-dark'>
					<Header colorClass={headerColor} />

					<div className='screen -center flex-col justify-start'>
						<div className='w-full flex-col gap-4 overflow-y-auto overflow-x-hidden pt-[55vw] sm:pt-[15vh]'>
							<h1 className='mb-8 text-center font-mono text-2xl font-extrabold text-white'>
								Socials
							</h1>
							<AnimatedButtonList
								buttons={socialButtons}
								onButtonClick={handleButtonClick}
								onTransitionStart={handleTransitionStart}
								onTransitionEnd={handleTransitionEnd}
								staggerDelay={150}
								animationDuration={400}
							/>
						</div>
					</div>

					<Footer goBack={false} signIn={false} signOut={false} />
				</main>
			</>
		)
	)
}

export default SocialsPage
