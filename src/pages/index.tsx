import React, {useEffect, useState} from 'react'
import Head from 'next/head'
// import Header from '../components/header'
import Footer from '../components/Footer'
import AnimatedButtonList from '../components/AnimatedButtonList'
//import SignInOut from "../components/signInOut"
//import { useStore } from "../../store/store"

interface ButtonItem {
	label: string
	path: string
	style?: string
	type?: 'internal' | 'external'
	disabled?: boolean
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
		disabled: true,
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
	// const {isTransitioning} = usePageTransition({
	// 	animationDuration: 400,
	// })

	const [testMessage, setTestMessage] = useState<string>('Loading...')
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchTestData = async () => {
			try {
				const response = await fetch('/api/test-database')
				if (response.ok) {
					const result = (await response.json()) as {
						data?: Array<{message: string}>
					}
					if (result.data && result.data[0]) {
						setTestMessage(result.data[0].message)
					} else {
						setTestMessage('No data found')
					}
				} else {
					setTestMessage('Failed to fetch data')
				}
			} catch (error) {
				console.error('Error fetching test data:', error)
				setTestMessage('Error connecting to database')
			} finally {
				setIsLoading(false)
			}
		}

		void fetchTestData()
	}, [])

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

			<main className='overflow-x-hidden bg-gradient-to-t from-primary-light to-primary-dark'>
				{/* <Header /> */}

				<div className='screen -center flex-col justify-start'>
					<div className='w-full flex-col gap-4 overflow-y-auto pt-[55vw] sm:pt-[15vh]'>
						<h2 className='mb-4 text-center text-white'>
							{isLoading ? 'Loading...' : testMessage}
						</h2>
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
