import * as React from 'react'
import AnimatedButtonList from '../../components/AnimatedButtonList'
import {getRubricColor} from '../../utils/colorRubric'

interface ButtonItem {
	label: string
	path: string
	style?: string
	type?: 'internal' | 'external'
	disabled?: boolean
}

const arcadeButtons: ButtonItem[] = [
	{
		label: 'HueBound',
		path: '/arcade/huebound',
		type: 'internal',
	},
	{
		label: 'Chromaze',
		path: '/arcade/chromaze',
		type: 'internal',
	},
	{
		label: 'TETRIS',
		path: '/arcade/tetris',
		type: 'internal',
	},
	{
		label: 'Godot',
		path: '/arcade/godot',
		type: 'internal',
	},
	{
		label: 'Mario',
		path: '/arcade/mario',
		type: 'internal',
	},
	{
		label: 'Back',
		path: '/',
		type: 'internal',
	},
]

const ArcadePage = () => {
	const backgroundClass = getRubricColor('arcade').background

	return (
		<main className={`overflow-x-hidden ${backgroundClass}`}>
			<div className='screen -center flex-col justify-start'>
				<div className='w-full flex-col gap-4 overflow-y-auto overflow-x-hidden pt-[55vw] sm:pt-[15vh]'>
					<AnimatedButtonList
						buttons={arcadeButtons}
						staggerDelay={150}
						animationDuration={400}
					/>
				</div>
			</div>
		</main>
	)
}

export default ArcadePage
