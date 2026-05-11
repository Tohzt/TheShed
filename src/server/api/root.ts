import {createTRPCRouter} from './trpc'
import {exampleRouter} from './routers/example'
import {devicesRouter} from './routers/sensors'
import {budgetRouter} from './routers/budget'
import {watchlistRouter} from './routers/watchlist'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
	example: exampleRouter,
	devices: devicesRouter,
	budget: budgetRouter,
	watchlist: watchlistRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
