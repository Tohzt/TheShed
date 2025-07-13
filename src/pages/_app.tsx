import {type AppType} from 'next/app'
import {type Session} from 'next-auth'
import {SessionProvider} from 'next-auth/react'
import {useRouter} from 'next/router'
import {useEffect, useState} from 'react'
import Header from '../components/header'
import {getRubricColor} from '../utils/colorRubric'
import {api} from '../utils/api'

import '../styles/globals.css'

const MyApp: AppType<{session: Session | null}> = ({
	Component,
	pageProps: {session, ...pageProps},
}) => {
	const router = useRouter()
	const [headerColorHex, setHeaderColorHex] = useState(
		getRubricColor('home').primaryHex
	)

	useEffect(() => {
		const path = router.pathname
		const color = getRubricColor(
			path === '/' ? 'home' : path.slice(1)
		).primaryHex
		setHeaderColorHex(color)
	}, [router.pathname])

	return (
		<SessionProvider session={session}>
			<Header colorHex={headerColorHex} />
			<Component {...pageProps} />
		</SessionProvider>
	)
}

export default api.withTRPC(MyApp)
