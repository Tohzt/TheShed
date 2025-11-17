import React, {useEffect, useState} from 'react'
import Head from 'next/head'
import {useRouter} from 'next/router'
import {signIn, signOut, useSession} from 'next-auth/react'
import Footer from '../components/Footer'
import AnimatedButtonList from '../components/AnimatedButtonList'

interface ButtonItem {
	label: string
	path: string
	style?: string
	type?: 'internal' | 'external'
	disabled?: boolean
	skipNavigation?: boolean
}

const getHomeButtons = (isLoggedIn: boolean): ButtonItem[] => [
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
		label: 'Smart Devices',
		path: '/smart-devices',
		type: 'internal',
	},
	// {
	// 	label: 'calendar',
	// 	path: '/',
	// 	style: 'bg-primary',
	// 	type: 'internal',
	// 	disabled: true,
	// },
	{
		label: 'arcade',
		path: '/arcade',
		type: 'internal',
	},
	...(isLoggedIn
		? [
				{
					label: 'Budget',
					path: '/budget',
					type: 'internal',
				} as ButtonItem,
		  ]
		: []),
	{
		label: 'about',
		path: '/about',
		type: 'internal',
	},
	{
		label: isLoggedIn ? 'Sign Out' : 'Sign In',
		path: '#',
		type: 'internal',
		skipNavigation: true,
	},
]

const Home: React.FC = () => {
	const router = useRouter()
	const {data: sessionData} = useSession()
	const [authError, setAuthError] = useState<string | null>(null)

	// Check for NextAuth errors in URL
	useEffect(() => {
		const error = router.query.error as string | undefined
		if (error) {
			const errorMessages: Record<string, string> = {
				Configuration: 'There is a problem with the server configuration.',
				AccessDenied: 'You do not have permission to sign in.',
				Verification:
					'The verification token has expired or has already been used.',
				Default: 'An error occurred during authentication.',
			}
			setAuthError(errorMessages[error] || errorMessages.Default)
			router.replace('/', undefined, {shallow: true})
		}
	}, [router.query.error, router])

	const homeButtons = getHomeButtons(!!sessionData)

	const handleButtonClick = async (button: ButtonItem, index: number) => {
		if (button.skipNavigation && button.label === 'Sign In') {
			await signIn('discord')
		} else if (button.skipNavigation && button.label === 'Sign Out') {
			await signOut()
		}
	}

	return (
		<>
			<Head>
				<title>The Shed</title>
				<meta name='description' content='Burnt by Tohzt' />
				<link rel='icon' href='/tohzt.ico' />
				<link rel='manifest' href='/manifest.json' />
			</Head>

			<main className='min-h-screen overflow-x-hidden bg-background'>
				<div className='screen -center flex-col justify-start'>
					<div className='w-full flex-col gap-4 overflow-y-auto pt-20'>
						{authError && (
							<div className='mx-auto mb-4 max-w-md rounded-lg bg-destructive p-4 text-center text-destructive-foreground'>
								<p className='font-semibold'>Authentication Error</p>
								<p className='text-sm'>{authError}</p>
								<button
									onClick={() => setAuthError(null)}
									className='mt-2 rounded bg-destructive/80 px-4 py-2 text-sm text-destructive-foreground transition-colors hover:bg-destructive/90'
								>
									Dismiss
								</button>
							</div>
						)}
						<AnimatedButtonList
							buttons={homeButtons}
							onButtonClick={handleButtonClick}
							staggerDelay={150}
							animationDuration={400}
						/>
					</div>
				</div>

				<Footer goBack={false} signIn={true} signOut={true} />
			</main>
		</>
	)
}

export default Home
