import type {NextApiRequest, NextApiResponse} from 'next'
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).json({message: 'Method not allowed'})
	}

	try {
		await prisma.$connect()
		const testData = await prisma.$queryRaw`
      SELECT message, created_at 
      FROM test_data 
      ORDER BY created_at DESC 
      LIMIT 1
    `
		res.status(200).json({data: testData})
	} catch (error) {
		res.status(500).json({
			error: 'Failed to fetch data from database',
			details: error instanceof Error ? error.message : 'Unknown error',
		})
	} finally {
		await prisma.$disconnect()
	}
}
