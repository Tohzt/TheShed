import React from 'react'
import Head from 'next/head'
import Header from '../components/header'
import Footer from '../components/Footer'
import AnimatedButtonList from '../components/AnimatedButtonList'
import {usePageTransition} from '../hooks/usePageTransition'
//import SignInOut from "../components/signInOut"
//import { useStore } from "../../store/store"

interface ButtonItem {
	label: string
	path: string
	style?: string
	type?: 'internal' | 'external'
}

const homeButtons: ButtonItem[] = [
	{
		label: 'Tasks',
		path: '/tasks',
		type: 'internal',
	},
	{
		label: 'Socials',
		path: '/socials',
		type: 'internal',
	},
	{
		label: 'calendar',
		path: '/',
		style: 'bg-primary',
		type: 'internal',
	},
	{
		label: 'arcade',
		path: '/arcade',
		type: 'internal',
	},
	{
		label: 'about',
		path: '/about',
		type: 'internal',
	},
]

const Home: React.FC = () => {
	const {isTransitioning} = usePageTransition({
		animationDuration: 400,
	})

	const handleButtonClick = (button: ButtonItem, index: number) => {
		console.log(`Clicked ${button.label} at index ${index}`)
	}

	const handleTransitionStart = () => {
		console.log('Transition starting...')
	}

	const handleTransitionEnd = () => {
		console.log('Transition ended')
	}

	//const toggleDarkMode = useStore(state => state.toggle_dark_mode)
	//const darkMode = useStore(state => state.dark_mode)

	return (
		<>
			<Head>
				<title>The Shed</title>
				<meta name='description' content='Burnt by Tohzt' />
				<link rel='icon' href='/tohzt.ico' />
				<link rel='manifest' href='/manifest.json' />
			</Head>

			<main className='fixed overflow-x-hidden bg-gradient-to-t from-primary-light to-primary-dark'>
				<Header />

				<div className='screen -center flex-col justify-start'>
					<div className='w-full flex-col gap-4 overflow-y-auto overflow-x-hidden pt-[55vw] sm:pt-[15vh]'>
						<AnimatedButtonList
							buttons={homeButtons}
							onButtonClick={handleButtonClick}
							onTransitionStart={handleTransitionStart}
							onTransitionEnd={handleTransitionEnd}
							staggerDelay={150}
							animationDuration={400}
						/>
						{/*
              <button onClick={() => { toggleDarkMode(!darkMode) }}>
                hello
              </button>
            */}
					</div>
				</div>

				<Footer goBack={false} signIn={true} signOut={true} />
			</main>
		</>
	)
}

export default Home
