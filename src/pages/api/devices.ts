import type {NextApiRequest, NextApiResponse} from 'next'
import {prisma} from '../../server/db'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).json({message: 'Method not allowed'})
	}

	try {
		const devices = await prisma.device.findMany({
			include: {
				readings: {
					take: 1,
					orderBy: {createdAt: 'desc'},
				},
			},
		})

		res.status(200).json(devices)
	} catch (error) {
		console.error('Error fetching devices:', error)
		res.status(500).json({
			error: 'Failed to fetch devices',
			details: error instanceof Error ? error.message : 'Unknown error',
		})
	}
}
