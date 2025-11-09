import NextAuth, {type NextAuthOptions} from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import {PrismaAdapter} from '@next-auth/prisma-adapter'

import {env} from '../../../env/server.mjs'
import {prisma} from '../../../server/db'

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		DiscordProvider({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET,
		}),
		/**
		 * ...add more providers here
		 *
		 * Most other providers require a bit more work than the Discord provider.
		 * For example, the GitHub provider requires you to add the
		 * `refresh_token_expires_in` field to the Account model. Refer to the
		 * NextAuth.js docs for the provider you want to use. Example:
		 * @see https://next-auth.js.org/providers/github
		 */
	],
	debug: process.env.NODE_ENV === 'development',
	callbacks: {
		session({session, user}) {
			if (session.user) {
				session.user.id = user.id
			}
			return session
		},
	},
	pages: {
		signIn: '/',
		error: '/',
	},
}

export default NextAuth(authOptions)
