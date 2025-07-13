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
		console.log('Attempting to connect to database...')

		// Test basic connection first
		await prisma.$connect()
		console.log('Database connection successful')

		// Check if the table exists
		const tables = await prisma.$queryRaw`
			SHOW TABLES LIKE 'test_data'
		`
		console.log('Tables check result:', tables)

		if (!tables || (Array.isArray(tables) && tables.length === 0)) {
			console.log('test_data table does not exist')
			return res.status(404).json({error: 'test_data table does not exist'})
		}

		const testData = await prisma.$queryRaw`
      SELECT message, created_at 
      FROM test_data 
      ORDER BY created_at DESC 
      LIMIT 1
    `

		console.log('Query result:', testData)
		res.status(200).json({data: testData})
	} catch (error) {
		console.error('Database error details:', error)
		res.status(500).json({
			error: 'Failed to fetch data from database',
			details: error instanceof Error ? error.message : 'Unknown error',
		})
	} finally {
		await prisma.$disconnect()
	}
}
