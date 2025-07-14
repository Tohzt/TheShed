import {z} from 'zod'
import {createTRPCRouter, publicProcedure} from '../trpc'

export const devicesRouter = createTRPCRouter({
	// Get all devices
	getAllDevices: publicProcedure.query(async ({ctx}) => {
		const devices = await ctx.prisma.device.findMany({
			include: {
				readings: {
					take: 1,
					orderBy: {createdAt: 'desc'},
				},
			},
		})
		return devices
	}),

	// Get device by ID
	getDevice: publicProcedure
		.input(z.object({deviceId: z.string()}))
		.query(async ({ctx, input}) => {
			const device = await ctx.prisma.device.findUnique({
				where: {id: input.deviceId},
				include: {
					readings: {
						take: 50,
						orderBy: {createdAt: 'desc'},
					},
				},
			})
			return device
		}),

	// Get latest reading for a specific device
	getLatestReading: publicProcedure
		.input(z.object({deviceId: z.string()}))
		.query(async ({ctx, input}) => {
			const latest = await ctx.prisma.devicereading.findFirst({
				where: {deviceId: input.deviceId},
				orderBy: {createdAt: 'desc'},
				include: {device: true},
			})
			return latest
		}),

	// Get device readings with pagination
	getDeviceReadings: publicProcedure
		.input(
			z.object({
				deviceId: z.string(),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
			})
		)
		.query(async ({ctx, input}) => {
			const readings = await ctx.prisma.devicereading.findMany({
				where: {deviceId: input.deviceId},
				take: input.limit,
				skip: input.offset,
				orderBy: {createdAt: 'desc'},
				include: {device: true},
			})
			return readings
		}),

	// Add new device reading
	addDeviceReading: publicProcedure
		.input(
			z.object({
				deviceId: z.string(),
				temperature: z.number().optional(),
				humidity: z.number().optional(),
				pressure: z.number().optional(),
				motion: z.boolean().optional(),
				light: z.number().optional(),
				metadata: z.string().optional(),
			})
		)
		.mutation(async ({ctx, input}) => {
			const reading = await ctx.prisma.devicereading.create({
				data: {
					deviceId: input.deviceId,
					temperature: input.temperature,
					humidity: input.humidity,
					pressure: input.pressure,
					motion: input.motion,
					light: input.light,
					metadata: input.metadata,
				},
				include: {device: true},
			})
			return reading
		}),

	// Register a new device
	registerDevice: publicProcedure
		.input(
			z.object({
				name: z.string(),
				type: z.string(),
				location: z.string(),
				description: z.string().optional(),
			})
		)
		.mutation(async ({ctx, input}) => {
			const device = await ctx.prisma.device.create({
				data: {
					name: input.name,
					type: input.type,
					location: input.location,
					description: input.description,
				},
			})
			return device
		}),

	// Get statistics for a device (last 24 hours)
	getDeviceStats: publicProcedure
		.input(z.object({deviceId: z.string()}))
		.query(async ({ctx, input}) => {
			const yesterday = new Date()
			yesterday.setDate(yesterday.getDate() - 1)

			const stats = await ctx.prisma.devicereading.aggregate({
				where: {
					deviceId: input.deviceId,
					createdAt: {
						gte: yesterday,
					},
				},
				_avg: {
					temperature: true,
					humidity: true,
					pressure: true,
					light: true,
				},
				_min: {
					temperature: true,
					humidity: true,
					pressure: true,
					light: true,
				},
				_max: {
					temperature: true,
					humidity: true,
					pressure: true,
					light: true,
				},
				_count: true,
			})

			return stats
		}),
})
