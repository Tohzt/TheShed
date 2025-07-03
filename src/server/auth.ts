import {type GetServerSidePropsContext} from 'next'
import {getServerSession} from 'next-auth'

import {authOptions} from '../pages/api/auth/[...nextauth]'

/**
 * Wrapper for auth function, used in trpc createContext and the
 * restricted API route
 *
 * @see https://authjs.dev/reference/nextjs
 */

export const getServerAuthSession = async (ctx: {
	req: GetServerSidePropsContext['req']
	res: GetServerSidePropsContext['res']
}) => {
	return await getServerSession(ctx.req, ctx.res, authOptions)
}
