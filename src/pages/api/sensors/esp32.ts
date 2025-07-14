import type {NextApiRequest, NextApiResponse} from 'next'
import {prisma} from '../../../server/db'

interface SensorBody {
	deviceName: string
	deviceType: string
	location: string
	temperature?: number
	humidity?: number
	pressure?: number
	motion?: boolean
	light?: number
	metadata?: string
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res.status(405).json({message: 'Method not allowed'})
	}

	try {
		const {
			deviceName,
			deviceType,
			location,
			temperature,
			humidity,
			pressure,
			motion,
			light,
			metadata,
		} = req.body as SensorBody

		// Validate required fields
		if (!deviceName || !deviceType || !location) {
			return res.status(400).json({
				error: 'Missing required fields: deviceName, deviceType, location',
			})
		}

		// Find or create the device
		let device = await prisma.device.findUnique({
			where: {name: deviceName},
		})

		if (!device) {
			device = await prisma.device.create({
				data: {
					name: deviceName,
					type: deviceType,
					location: location,
					description: `Auto-registered ${deviceType} device in ${location}`,
				},
			})
		}

		// Store the reading
		const reading = await prisma.devicereading.create({
			data: {
				device: {connect: {id: device.id}},
				temperature: typeof temperature === 'number' ? temperature : null,
				humidity: typeof humidity === 'number' ? humidity : null,
				pressure: typeof pressure === 'number' ? pressure : null,
				motion: typeof motion === 'boolean' ? motion : null,
				light: typeof light === 'number' ? light : null,
				metadata: typeof metadata === 'string' ? metadata : null,
			},
			include: {device: true},
		})

		res.status(200).json({
			success: true,
			message: 'Device reading stored successfully',
			device: {
				id: device.id,
				name: device.name,
				type: device.type,
				location: device.location,
			},
			reading: {
				id: reading.id,
				temperature: reading.temperature,
				humidity: reading.humidity,
				pressure: reading.pressure,
				motion: reading.motion,
				light: reading.light,
				createdAt: reading.createdAt,
			},
		})
	} catch (error) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const details = error instanceof Error ? error.message : 'Unknown error'
		console.error('Error storing device reading:', error)
		res.status(500).json({
			error: 'Failed to store device reading',
			details,
		})
	}
}
