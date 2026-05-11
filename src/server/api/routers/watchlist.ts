import {z} from 'zod'
import {createTRPCRouter, protectedProcedure} from '../trpc'

export const watchlistRouter = createTRPCRouter({
	// Get all shows for the current user
	getShows: protectedProcedure
		.input(
			z.object({
				status: z.enum(['not-started', 'watching', 'caught-up', 'completed', 'dropped']).optional(),
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
				currentEpisode: show.currentEpisode,
				totalSeasonsTracked: show.totalSeasonsTracked,
				episodesPerSeason: show.episodesPerSeason,
				nextSeasonNumber: show.nextSeasonNumber,
				nextSeasonReleaseDate: show.nextSeasonReleaseDate
					? show.nextSeasonReleaseDate.toISOString().split('T')[0]
					: null,
				nextEpisodeReleaseDate: show.nextEpisodeReleaseDate
					? show.nextEpisodeReleaseDate.toISOString().split('T')[0]
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
				currentEpisode: show.currentEpisode,
				totalSeasonsTracked: show.totalSeasonsTracked,
				episodesPerSeason: show.episodesPerSeason,
				nextSeasonNumber: show.nextSeasonNumber,
				nextSeasonReleaseDate: show.nextSeasonReleaseDate
					? show.nextSeasonReleaseDate.toISOString().split('T')[0]
					: null,
				nextEpisodeReleaseDate: show.nextEpisodeReleaseDate
					? show.nextEpisodeReleaseDate.toISOString().split('T')[0]
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
				status: z.enum(['not-started', 'watching', 'caught-up', 'completed', 'dropped']).default('not-started'),
				currentSeason: z.number().int().positive().optional(),
				currentEpisode: z.number().int().nonnegative().optional(),
				totalSeasonsTracked: z.number().int().positive().optional(),
				episodesPerSeason: z.number().int().positive().optional(),
				nextSeasonNumber: z.number().int().positive().optional(),
				nextSeasonReleaseDate: z.string().optional(), // YYYY-MM-DD format
				nextEpisodeReleaseDate: z.string().optional(), // YYYY-MM-DD format
				notes: z.string().optional(),
				posterUrl: z.string().optional(),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.session.user.id

			// Parse dates if provided
			let nextSeasonReleaseDate: Date | null = null
			if (input.nextSeasonReleaseDate) {
				const [year, month, day] = input.nextSeasonReleaseDate.split('-').map(Number)
				nextSeasonReleaseDate = new Date(year, month - 1, day)
			}

			let nextEpisodeReleaseDate: Date | null = null
			if (input.nextEpisodeReleaseDate) {
				const [year, month, day] = input.nextEpisodeReleaseDate.split('-').map(Number)
				nextEpisodeReleaseDate = new Date(year, month - 1, day)
			}

			const show = await ctx.prisma.watchlistshow.create({
				data: {
					userId,
					title: input.title,
					status: input.status,
					currentSeason: input.currentSeason,
					currentEpisode: input.currentEpisode,
					totalSeasonsTracked: input.totalSeasonsTracked,
					episodesPerSeason: input.episodesPerSeason,
					nextSeasonNumber: input.nextSeasonNumber,
					nextSeasonReleaseDate,
					nextEpisodeReleaseDate,
					notes: input.notes,
					posterUrl: input.posterUrl,
				},
			})

			return {
				id: show.id,
				title: show.title,
				status: show.status,
				currentSeason: show.currentSeason,
				currentEpisode: show.currentEpisode,
				totalSeasonsTracked: show.totalSeasonsTracked,
				episodesPerSeason: show.episodesPerSeason,
				nextSeasonNumber: show.nextSeasonNumber,
				nextSeasonReleaseDate: show.nextSeasonReleaseDate
					? show.nextSeasonReleaseDate.toISOString().split('T')[0]
					: null,
				nextEpisodeReleaseDate: show.nextEpisodeReleaseDate
					? show.nextEpisodeReleaseDate.toISOString().split('T')[0]
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
				status: z.enum(['not-started', 'watching', 'caught-up', 'completed', 'dropped']).optional(),
				currentSeason: z.number().int().positive().optional(),
				currentEpisode: z.number().int().nonnegative().optional(),
				totalSeasonsTracked: z.number().int().positive().optional(),
				episodesPerSeason: z.number().int().positive().optional(),
				nextSeasonNumber: z.number().int().positive().optional(),
				nextSeasonReleaseDate: z.string().optional(), // YYYY-MM-DD format
				nextEpisodeReleaseDate: z.string().optional(), // YYYY-MM-DD format
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

			// Parse dates if provided
			let nextSeasonReleaseDate: Date | null | undefined = undefined
			if (updateData.nextSeasonReleaseDate !== undefined) {
				if (updateData.nextSeasonReleaseDate === '') {
					nextSeasonReleaseDate = null
				} else {
					const [year, month, day] = updateData.nextSeasonReleaseDate.split('-').map(Number)
					nextSeasonReleaseDate = new Date(year, month - 1, day)
				}
			}

			let nextEpisodeReleaseDate: Date | null | undefined = undefined
			if (updateData.nextEpisodeReleaseDate !== undefined) {
				if (updateData.nextEpisodeReleaseDate === '') {
					nextEpisodeReleaseDate = null
				} else {
					const [year, month, day] = updateData.nextEpisodeReleaseDate.split('-').map(Number)
					nextEpisodeReleaseDate = new Date(year, month - 1, day)
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
					...(updateData.currentEpisode !== undefined && {
						currentEpisode: updateData.currentEpisode,
					}),
					...(updateData.totalSeasonsTracked !== undefined && {
						totalSeasonsTracked: updateData.totalSeasonsTracked,
					}),
					...(updateData.episodesPerSeason !== undefined && {
						episodesPerSeason: updateData.episodesPerSeason,
					}),
					...(updateData.nextSeasonNumber !== undefined && {
						nextSeasonNumber: updateData.nextSeasonNumber,
					}),
					...(nextSeasonReleaseDate !== undefined && {nextSeasonReleaseDate}),
					...(nextEpisodeReleaseDate !== undefined && {nextEpisodeReleaseDate}),
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
				currentEpisode: updatedShow.currentEpisode,
				totalSeasonsTracked: updatedShow.totalSeasonsTracked,
				episodesPerSeason: updatedShow.episodesPerSeason,
				nextSeasonNumber: updatedShow.nextSeasonNumber,
				nextSeasonReleaseDate: updatedShow.nextSeasonReleaseDate
					? updatedShow.nextSeasonReleaseDate.toISOString().split('T')[0]
					: null,
				nextEpisodeReleaseDate: updatedShow.nextEpisodeReleaseDate
					? updatedShow.nextEpisodeReleaseDate.toISOString().split('T')[0]
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
