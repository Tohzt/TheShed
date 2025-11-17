import * as React from 'react'
import AnimatedButtonList from '../../components/AnimatedButtonList'

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
	return (
		<main className='min-h-screen overflow-x-hidden bg-background'>
			<div className='screen -center flex-col justify-start'>
				<div className='w-full flex-col gap-4 overflow-y-auto overflow-x-hidden pt-20'>
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
