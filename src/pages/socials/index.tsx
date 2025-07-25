import * as React from 'react'
// import Header from '../../components/header'
import Footer from '../../components/Footer'
import AnimatedButtonList from '../../components/AnimatedButtonList'
import {getRubricColor} from '../../utils/colorRubric'

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
	// const {isTransitioning} = usePageTransition({
	// 	animationDuration: 400,
	// })

	// const [headerColorHex] = React.useState(getRubricColor('socials').primaryHex)
	const backgroundClass = getRubricColor('socials').background

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
				<main className={`overflow-x-hidden ${backgroundClass}`}>
					{/* <Header colorHex={headerColorHex} /> */}

					<div className='screen -center flex-col justify-start'>
						<div className='w-full flex-col gap-4 overflow-y-auto overflow-x-hidden pt-[55vw] sm:pt-[15vh]'>
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
