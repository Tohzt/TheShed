import {z} from 'zod'
import {createTRPCRouter, protectedProcedure} from '../trpc'

export const watchlistRouter = createTRPCRouter({
	// Get all shows for the current user
	getShows: protectedProcedure
		.input(
			z.object({
				status: z.enum(['watching', 'completed', 'dropped']).optional(),
			})
		)
		.query(async ({ctx, input}) => {
			const userId = ctx.session.user.id

			const shows = await ctx.prisma.watchlistshow.findMany({
				where: {
					userId,
					...(input.status && {status: input.status}),
				},
				orderBy: {updatedAt: 'desc'},
			})

			return shows.map((show) => ({
				id: show.id,
				title: show.title,
				status: show.status,
				currentSeason: show.currentSeason,
				nextSeasonNumber: show.nextSeasonNumber,
				nextSeasonDate: show.nextSeasonDate
					? show.nextSeasonDate.toISOString().split('T')[0]
					: null,
				notes: show.notes,
				posterUrl: show.posterUrl,
			}))
		}),

	// Get a single show
	getShow: protectedProcedure
		.input(z.object({showId: z.string()}))
		.query(async ({ctx, input}) => {
			const userId = ctx.session.user.id

			const show = await ctx.prisma.watchlistshow.findFirst({
				where: {
					id: input.showId,
					userId,
				},
			})

			if (!show) {
				throw new Error('Show not found')
			}

			return {
				id: show.id,
				title: show.title,
				status: show.status,
				currentSeason: show.currentSeason,
				nextSeasonNumber: show.nextSeasonNumber,
				nextSeasonDate: show.nextSeasonDate
					? show.nextSeasonDate.toISOString().split('T')[0]
					: null,
				notes: show.notes,
				posterUrl: show.posterUrl,
			}
		}),

	// Create a new show
	createShow: protectedProcedure
		.input(
			z.object({
				title: z.string().min(1),
				status: z.enum(['watching', 'completed', 'dropped']).default('watching'),
				currentSeason: z.number().int().positive().optional(),
				nextSeasonNumber: z.number().int().positive().optional(),
				nextSeasonDate: z.string().optional(), // YYYY-MM-DD format
				notes: z.string().optional(),
				posterUrl: z.string().optional(),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.session.user.id

			// Parse date if provided
			let nextSeasonDate: Date | null = null
			if (input.nextSeasonDate) {
				const [year, month, day] = input.nextSeasonDate.split('-').map(Number)
				nextSeasonDate = new Date(year, month - 1, day)
			}

			const show = await ctx.prisma.watchlistshow.create({
				data: {
					userId,
					title: input.title,
					status: input.status,
					currentSeason: input.currentSeason,
					nextSeasonNumber: input.nextSeasonNumber,
					nextSeasonDate,
					notes: input.notes,
					posterUrl: input.posterUrl,
				},
			})

			return {
				id: show.id,
				title: show.title,
				status: show.status,
				currentSeason: show.currentSeason,
				nextSeasonNumber: show.nextSeasonNumber,
				nextSeasonDate: show.nextSeasonDate
					? show.nextSeasonDate.toISOString().split('T')[0]
					: null,
				notes: show.notes,
				posterUrl: show.posterUrl,
			}
		}),

	// Update a show
	updateShow: protectedProcedure
		.input(
			z.object({
				showId: z.string(),
				title: z.string().min(1).optional(),
				status: z.enum(['watching', 'completed', 'dropped']).optional(),
				currentSeason: z.number().int().positive().optional(),
				nextSeasonNumber: z.number().int().positive().optional(),
				nextSeasonDate: z.string().optional(), // YYYY-MM-DD format
				notes: z.string().optional(),
				posterUrl: z.string().optional(),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.session.user.id
			const {showId, ...updateData} = input

			// Verify the show belongs to the user
			const show = await ctx.prisma.watchlistshow.findFirst({
				where: {
					id: showId,
					userId,
				},
			})

			if (!show) {
				throw new Error('Show not found')
			}

			// Parse date if provided
			let nextSeasonDate: Date | null | undefined = undefined
			if (updateData.nextSeasonDate !== undefined) {
				if (updateData.nextSeasonDate === '') {
					nextSeasonDate = null
				} else {
					const [year, month, day] = updateData.nextSeasonDate.split('-').map(Number)
					nextSeasonDate = new Date(year, month - 1, day)
				}
			}

			const updatedShow = await ctx.prisma.watchlistshow.update({
				where: {id: showId},
				data: {
					...(updateData.title && {title: updateData.title}),
					...(updateData.status && {status: updateData.status}),
					...(updateData.currentSeason !== undefined && {
						currentSeason: updateData.currentSeason,
					}),
					...(updateData.nextSeasonNumber !== undefined && {
						nextSeasonNumber: updateData.nextSeasonNumber,
					}),
					...(nextSeasonDate !== undefined && {nextSeasonDate}),
					...(updateData.notes !== undefined && {notes: updateData.notes}),
					...(updateData.posterUrl !== undefined && {
						posterUrl: updateData.posterUrl,
					}),
				},
			})

			return {
				id: updatedShow.id,
				title: updatedShow.title,
				status: updatedShow.status,
				currentSeason: updatedShow.currentSeason,
				nextSeasonNumber: updatedShow.nextSeasonNumber,
				nextSeasonDate: updatedShow.nextSeasonDate
					? updatedShow.nextSeasonDate.toISOString().split('T')[0]
					: null,
				notes: updatedShow.notes,
				posterUrl: updatedShow.posterUrl,
			}
		}),

	// Delete a show
	deleteShow: protectedProcedure
		.input(z.object({showId: z.string()}))
		.mutation(async ({ctx, input}) => {
			const userId = ctx.session.user.id

			// Verify the show belongs to the user
			const show = await ctx.prisma.watchlistshow.findFirst({
				where: {
					id: input.showId,
					userId,
				},
			})

			if (!show) {
				throw new Error('Show not found')
			}

			return await ctx.prisma.watchlistshow.delete({
				where: {id: input.showId},
			})
		}),
})
