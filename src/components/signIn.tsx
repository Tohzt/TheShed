import React from 'react'
import {signIn, signOut, useSession} from 'next-auth/react'

const SignIn: React.FC = () => {
	const {data: sessionData} = useSession()

	const handleSignInOut = async () => {
		if (!sessionData) {
			await signIn('discord')
		} else {
			await signOut()
		}
	}

	return (
		<button
			className='h-[5em] w-[5em] rounded-2xl border-2 border-white bg-primary-light text-white'
			onClick={() => void handleSignInOut()}
		>
			{sessionData ? 'Sign Out' : 'Sign In'}
		</button>
	)
}

export default SignIn
