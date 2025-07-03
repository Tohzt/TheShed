import {type AppType} from 'next/app'
import {type Session} from 'next-auth'
import {SessionProvider} from 'next-auth/react'
import {useEffect} from 'react'

import {api} from '../utils/api'

import '../styles/globals.css'

const MyApp: AppType<{session: Session | null}> = ({
	Component,
	pageProps: {session, ...pageProps},
}) => {
	useEffect(() => {
		function registerSW() {
			navigator.serviceWorker.register('/sw.js').then(
				(reg) => {
					console.log('Service worker registered: ', reg.scope)
				},
				(err) => {
					console.error('Service worker registration failed: ', err)
				}
			)
		}
		if (document.readyState === 'complete') {
			registerSW()
		} else {
			window.addEventListener('load', registerSW)
			return () => window.removeEventListener('load', registerSW)
		}
	}, [])

	return (
		<SessionProvider session={session}>
			<Component {...pageProps} />
		</SessionProvider>
	)
}

export default api.withTRPC(MyApp)
