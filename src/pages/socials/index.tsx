import * as React from 'react'
import Header from '../../components/header'
import Footer from '../../components/Footer'
import SocialButtons from '../../components/SocialButtons'

interface socialType {
	[key: string]: {
		path: string
		style: string
	}
}
const socials: socialType = {
	'Personal Instagram': {
		path: 'https://www.instagram.com/im_just.a.me',
		style: '',
	},
	'Tattoo Instagram': {
		path: 'https://www.instagram.com/tat.tohzt',
		style: '',
	},
	'Personal YouTube': {
		path: 'https://www.youtube.com/c/godsautobiography',
		style: '',
	},
	'LetsClone YouTube': {
		path: 'https://www.youtube.com/c/letsclone',
		style: '',
	},
	Back: {
		path: '/',
		style: '',
	},
}

const displaySocials = () => {
	return Object.keys(socials).map((page, index) => {
		const style =
			socials[page]?.style +
			(index % 2 === 0 ? ' offset-left' : ' offset-right')
		return (
			<SocialButtons
				key={index}
				path={socials[page]?.path}
				label={page}
				style={style}
			/>
		)
	})
}

const SocialsPage = () => {
	return (
		true && (
			<>
				<main className='bg-gradient-to-t from-primary-light to-primary-dark'>
					<Header />

					<div className='screen -center flex-col justify-start'>
						<div className='w-full flex-col gap-4 overflow-y-auto pt-[55vw] sm:pt-[15vh]'>
							<h1 className='mb-8 text-center font-mono text-2xl font-extrabold text-white'>
								Socials
							</h1>
							{displaySocials()}
						</div>
					</div>

					<Footer goBack={false} signIn={false} signOut={false} />
				</main>
			</>
		)
	)
}

export default SocialsPage
