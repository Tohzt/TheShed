import {z} from 'zod'
import {Prisma} from '@prisma/client'
import {createTRPCRouter, protectedProcedure} from '../trpc'
import type {PrismaClient} from '@prisma/client'

// Helper function to sync automated items to statements
async function syncAutomatedItemsToStatements(
	prisma: PrismaClient,
	userId: string
) {
	// Get all automated items for this user
	const automatedItems = (await prisma.automateditem.findMany({
		where: {userId},
	})) as Array<{
		id: string
		userId: string
		label: string
		amount: number
		type: string
		month: number
		year: number
		dates: string[]
		createdAt: Date
		updatedAt: Date
	}>

	// Helper function to parse YYYY-MM-DD string as local date (not UTC)
	const parseDateLocal = (dateStr: string): Date => {
		const [y, m, d] = dateStr.split('-').map(Number)
		return new Date(y, m - 1, d)
	}

	// Process each automated item
	for (const item of automatedItems) {
		// Parse dates array from JSON
		const dates = Array.isArray(item.dates)
			? item.dates
			: typeof item.dates === 'string'
			? JSON.parse(item.dates)
			: []

		// For each date, ensure a statement exists
		for (const dateStr of dates) {
			const [year, month, day] = dateStr.split('-').map(Number) as [
				number,
				number,
				number
			]
			const date = new Date(year, month - 1, day)

			// Check if a statement already exists for this automated item + date
			const existingStatement = await prisma.statement.findFirst({
				where: {
					userId,
					description: item.label,
					amount: item.amount,
					type: item.type,
					date: {
						gte: new Date(year, month - 1, day),
						lt: new Date(year, month - 1, day + 1),
					},
				},
			})

			// If no statement exists, create one
			if (!existingStatement) {
				// Find the category by name (if it exists)
				const budgetCategory = await prisma.budgetcategory.findFirst({
					where: {
						userId,
						name: item.label,
					},
				})

				await prisma.statement.create({
					data: {
						userId,
						categoryId: budgetCategory?.id,
						category: item.label,
						type: item.type,
						amount: item.amount,
						description: item.label,
						date: date,
					},
				})
			}
		}
	}
}

export const budgetRouter = createTRPCRouter({
	// Get current month's budget data
	getMonthlyBudget: protectedProcedure
		.input(
			z.object({
				month: z.number().min(1).max(12).optional(),
				year: z.number().optional(),
			})
		)
		.query(async ({ctx, input}) => {
			const userId = ctx.session.user.id
			const now = new Date()
			const month = input.month ?? now.getMonth() + 1
			const year = input.year ?? now.getFullYear()

			// Get all budget categories for this user
			const categories = await ctx.prisma.budgetcategory.findMany({
				where: {userId},
				orderBy: {name: 'asc'},
			})

			// Get statements for this month
			// month is 1-indexed (1-12), Date constructor uses 0-indexed months (0-11)
			const statements = await ctx.prisma.statement.findMany({
				where: {
					userId,
					date: {
						gte: new Date(year, month - 1, 1),
						lte: new Date(year, month, 0, 23, 59, 59, 999),
					},
				},
				orderBy: {date: 'asc'},
				take: 50, // Limit to 50 most recent
			})

			// Calculate income and expenses per category
			const categoryIncome = new Map<string, number>()
			const categoryExpenses = new Map<string, number>()
			statements.forEach((statement) => {
				if (statement.type === 'income') {
					const current = categoryIncome.get(statement.category) || 0
					categoryIncome.set(statement.category, current + statement.amount)
				} else if (statement.type === 'expense') {
					const current = categoryExpenses.get(statement.category) || 0
					categoryExpenses.set(statement.category, current + statement.amount)
				}
			})

			// Combine categories with income and expense amounts
			const categoriesWithSpent = categories.map((cat) => ({
				id: cat.id,
				name: cat.name,
				allocated: cat.allocated,
				expense: categoryExpenses.get(cat.name) || 0,
				income: categoryIncome.get(cat.name) || 0,
				icon: cat.icon,
				color: cat.color,
			}))

			// Get all automated items for this user (we'll filter by dates)
			const allAutomatedItems = (await ctx.prisma.automateditem.findMany({
				where: {
					userId,
				},
				orderBy: {createdAt: 'asc'},
			})) as Array<{
				id: string
				userId: string
				label: string
				amount: number
				type: string
				month: number
				year: number
				dates: string[]
				createdAt: Date
				updatedAt: Date
			}>

			// Helper function to parse YYYY-MM-DD string as local date (not UTC)
			const parseDateLocal = (dateStr: string): Date => {
				const [y, m, d] = dateStr.split('-').map(Number)
				return new Date(y, m - 1, d)
			}

			// Filter items where at least one date falls within the selected month/year
			const monthStart = new Date(year, month - 1, 1)
			const monthEnd = new Date(year, month, 0, 23, 59, 59, 999)

			const automatedItems = allAutomatedItems.filter((item) => {
				// Parse dates array from JSON
				const dates = Array.isArray(item.dates)
					? item.dates
					: typeof item.dates === 'string'
					? JSON.parse(item.dates)
					: []

				// Check if any date falls within the month
				return dates.some((dateStr: string) => {
					const date = parseDateLocal(dateStr)
					return date >= monthStart && date <= monthEnd
				})
			})

			// Calculate net income: income items - expense items (no base income)
			const incomeItems = automatedItems
				.filter((item) => item.type === 'income')
				.reduce((sum, item) => sum + item.amount, 0)
			const expenseItems = automatedItems
				.filter((item) => item.type === 'expense')
				.reduce((sum, item) => sum + item.amount, 0)
			const netIncome = incomeItems - expenseItems

			return {
				income: netIncome,
				automatedItems: automatedItems.map((item) => {
					// Parse dates array
					const dates = Array.isArray(item.dates)
						? item.dates
						: typeof item.dates === 'string'
						? JSON.parse(item.dates)
						: []

					return {
						id: item.id,
						label: item.label,
						amount: item.amount,
						type: item.type,
						dates: dates,
					}
				}),
				categories: categoriesWithSpent,
				statements: statements.map((stmt) => {
					// Format date as YYYY-MM-DD
					// Since dates are stored as local dates (midnight local time),
					// we use UTC methods to extract the date components
					// This ensures we get the exact date that was stored, regardless of server timezone
					const date = new Date(stmt.date)
					const year = date.getUTCFullYear()
					const month = String(date.getUTCMonth() + 1).padStart(2, '0')
					const day = String(date.getUTCDate()).padStart(2, '0')
					return {
						id: stmt.id,
						category: stmt.category,
						type: stmt.type,
						amount: stmt.amount,
						description: stmt.description,
						date: `${year}-${month}-${day}`,
					}
				}),
			}
		}),

	// Create a new statement
	createStatement: protectedProcedure
		.input(
			z.object({
				category: z.string(),
				type: z.enum(['income', 'expense']),
				amount: z.number().min(0.01),
				description: z.string().min(1),
				date: z.string(), // YYYY-MM-DD format (local date, not UTC)
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.session.user.id

			// Find the category by name
			const budgetCategory = await ctx.prisma.budgetcategory.findFirst({
				where: {
					userId,
					name: input.category,
				},
			})

			// Parse YYYY-MM-DD as local date (not UTC)
			// This ensures the date stored is exactly what the user selected
			const [year, month, day] = input.date.split('-').map(Number)
			const localDate = new Date(year, month - 1, day)

			return await ctx.prisma.statement.create({
				data: {
					userId,
					categoryId: budgetCategory?.id,
					category: input.category,
					type: input.type,
					amount: input.amount,
					description: input.description,
					date: localDate,
				},
			})
		}),

	// Update an existing statement
	updateStatement: protectedProcedure
		.input(
			z.object({
				statementId: z.string(),
				category: z.string().optional(),
				type: z.enum(['income', 'expense']).optional(),
				amount: z.number().min(0.01).optional(),
				description: z.string().min(1).optional(),
				date: z.string().optional(), // ISO date string
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.session.user.id
			const {statementId, ...updateData} = input

			// Verify the statement belongs to the user
			const statement = await ctx.prisma.statement.findFirst({
				where: {
					id: statementId,
					userId,
				},
			})

			if (!statement) {
				throw new Error('Statement not found')
			}

			// If category is being updated, find the new category
			let categoryId = statement.categoryId
			if (updateData.category && updateData.category !== statement.category) {
				const budgetCategory = await ctx.prisma.budgetcategory.findFirst({
					where: {
						userId,
						name: updateData.category,
					},
				})
				categoryId = budgetCategory?.id || null
			}

			return await ctx.prisma.statement.update({
				where: {id: statementId},
				data: {
					...(updateData.category && {
						category: updateData.category,
						categoryId,
					}),
					...(updateData.type && {type: updateData.type}),
					...(updateData.amount !== undefined && {
						amount: updateData.amount,
					}),
					...(updateData.description && {description: updateData.description}),
					...(updateData.date &&
						(() => {
							// Parse YYYY-MM-DD as local date (not UTC)
							const [year, month, day] = updateData.date.split('-').map(Number)
							return {date: new Date(year, month - 1, day)}
						})()),
				},
			})
		}),

	// Delete a statement
	deleteStatement: protectedProcedure
		.input(
			z.object({
				statementId: z.string(),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.session.user.id

			// Verify the statement belongs to the user
			const statement = await ctx.prisma.statement.findFirst({
				where: {
					id: input.statementId,
					userId,
				},
			})

			if (!statement) {
				throw new Error('Statement not found')
			}

			return await ctx.prisma.statement.delete({
				where: {id: input.statementId},
			})
		}),

	// Create a new budget category
	createCategory: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				allocated: z.number().min(0),
				icon: z.string().nullable().optional(),
				color: z.string().nullable().optional(),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.session.user.id

			return await ctx.prisma.budgetcategory.create({
				data: {
					userId,
					name: input.name,
					allocated: input.allocated,
					icon: input.icon ?? null,
					color: input.color ?? null,
				},
			})
		}),

	// Update an existing budget category
	updateCategory: protectedProcedure
		.input(
			z.object({
				categoryId: z.string(),
				name: z.string().min(1).optional(),
				allocated: z.number().min(0).optional(),
				icon: z.string().nullable().optional(),
				color: z.string().nullable().optional(),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.session.user.id
			const {categoryId, ...updateData} = input

			// Verify the category belongs to the user
			const category = await ctx.prisma.budgetcategory.findFirst({
				where: {
					id: categoryId,
					userId,
				},
			})

			if (!category) {
				throw new Error('Category not found')
			}

			const oldCategoryName = category.name
			const newCategoryName = updateData.name

			// Update the category
			const updatedCategory = await ctx.prisma.budgetcategory.update({
				where: {id: categoryId},
				data: {
					...(updateData.name && {name: updateData.name}),
					...(updateData.allocated !== undefined && {
						allocated: updateData.allocated,
					}),
					...(updateData.icon !== undefined && {icon: updateData.icon}),
					...(updateData.color !== undefined && {color: updateData.color}),
				},
			})

			// If the category name changed, update all related statements
			if (newCategoryName && newCategoryName !== oldCategoryName) {
				await ctx.prisma.statement.updateMany({
					where: {
						userId,
						category: oldCategoryName,
					},
					data: {
						category: newCategoryName,
					},
				})
			}

			return updatedCategory
		}),

	// Delete a budget category
	deleteCategory: protectedProcedure
		.input(
			z.object({
				categoryId: z.string(),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.session.user.id

			// Verify the category belongs to the user
			const category = await ctx.prisma.budgetcategory.findFirst({
				where: {
					id: input.categoryId,
					userId,
				},
			})

			if (!category) {
				throw new Error('Category not found')
			}

			return await ctx.prisma.budgetcategory.delete({
				where: {id: input.categoryId},
			})
		}),

	// Get automated items for a specific month/year
	getAutomatedItems: protectedProcedure
		.input(
			z.object({
				month: z.number().min(1).max(12),
				year: z.number(),
			})
		)
		.query(async ({ctx, input}) => {
			const userId = ctx.session.user.id

			return await ctx.prisma.automateditem.findMany({
				where: {
					userId,
					month: input.month,
					year: input.year,
				},
				orderBy: {createdAt: 'asc'},
			})
		}),

	// Create a new automated item
	createAutomatedItem: protectedProcedure
		.input(
			z.object({
				label: z.string().min(1),
				amount: z.number().min(0),
				type: z.enum(['income', 'expense']),
				month: z.number().min(1).max(12),
				year: z.number(),
				dates: z.array(z.string()).min(1, 'At least one date is required'),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.session.user.id

			const item = await ctx.prisma.automateditem.create({
				data: {
					userId,
					label: input.label,
					amount: input.amount,
					type: input.type,
					month: input.month,
					year: input.year,
					dates: input.dates as Prisma.InputJsonValue,
				} as Prisma.automateditemUncheckedCreateInput,
			})

			// Sync automated items to statements after creation
			// We'll do this in a fire-and-forget manner to avoid blocking the response
			syncAutomatedItemsToStatements(ctx.prisma, userId).catch((err) => {
				// Log error but don't fail the mutation
				console.error('Error syncing automated items to statements:', err)
			})

			return item
		}),

	// Update an existing automated item
	updateAutomatedItem: protectedProcedure
		.input(
			z.object({
				itemId: z.string(),
				label: z.string().min(1).optional(),
				amount: z.number().min(0).optional(),
				type: z.enum(['income', 'expense']).optional(),
				dates: z
					.array(z.string())
					.min(1, 'At least one date is required')
					.optional(),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.session.user.id
			const {itemId, ...updateData} = input

			// Verify the item belongs to the user and get the old item
			const oldItem = await ctx.prisma.automateditem.findFirst({
				where: {
					id: itemId,
					userId,
				},
			})

			if (!oldItem) {
				throw new Error('Automated item not found')
			}

			// Parse old dates from JSON
			const oldDates = Array.isArray(oldItem.dates)
				? oldItem.dates
				: typeof oldItem.dates === 'string'
				? JSON.parse(oldItem.dates)
				: []

			// Delete old statements that match the old item
			for (const dateStr of oldDates) {
				const [year, month, day] = dateStr.split('-').map(Number) as [
					number,
					number,
					number
				]

				await ctx.prisma.statement.deleteMany({
					where: {
						userId,
						description: oldItem.label,
						amount: oldItem.amount,
						type: oldItem.type,
						date: {
							gte: new Date(year, month - 1, day),
							lt: new Date(year, month - 1, day + 1),
						},
					},
				})
			}

			// Update the automated item
			const updatedItem = await ctx.prisma.automateditem.update({
				where: {id: itemId},
				data: updateData,
			})

			// Sync automated items to statements after update
			// We'll do this in a fire-and-forget manner to avoid blocking the response
			syncAutomatedItemsToStatements(ctx.prisma, userId).catch((err) => {
				// Log error but don't fail the mutation
				console.error('Error syncing automated items to statements:', err)
			})

			return updatedItem
		}),

	// Delete an automated item
	deleteAutomatedItem: protectedProcedure
		.input(
			z.object({
				itemId: z.string(),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.session.user.id

			// Verify the item belongs to the user and get it
			const item = await ctx.prisma.automateditem.findFirst({
				where: {
					id: input.itemId,
					userId,
				},
			})

			if (!item) {
				throw new Error('Automated item not found')
			}

			// Parse dates from JSON
			const dates = Array.isArray(item.dates)
				? item.dates
				: typeof item.dates === 'string'
				? JSON.parse(item.dates)
				: []

			// Delete all statements that match this automated item
			// Match by label, amount, type, and date
			for (const dateStr of dates) {
				const [year, month, day] = dateStr.split('-').map(Number) as [
					number,
					number,
					number
				]
				const date = new Date(year, month - 1, day)

				await ctx.prisma.statement.deleteMany({
					where: {
						userId,
						description: item.label,
						amount: item.amount,
						type: item.type,
						date: {
							gte: new Date(year, month - 1, day),
							lt: new Date(year, month - 1, day + 1),
						},
					},
				})
			}

			return await ctx.prisma.automateditem.delete({
				where: {id: input.itemId},
			})
		}),

	// Sync automated items to statements
	// This function ensures all automated items have corresponding statements
	syncAutomatedItemsToStatements: protectedProcedure.mutation(async ({ctx}) => {
		const userId = ctx.session.user.id
		await syncAutomatedItemsToStatements(ctx.prisma, userId)
		return {success: true}
	}),

	// Get statements by category name
	getStatementsByCategory: protectedProcedure
		.input(
			z.object({
				categoryName: z.string(),
			})
		)
		.query(async ({ctx, input}) => {
			const userId = ctx.session.user.id

			const statements = await ctx.prisma.statement.findMany({
				where: {
					userId,
					category: input.categoryName,
				},
				orderBy: {date: 'desc'},
			})

			return statements.map((stmt) => {
				// Format date as YYYY-MM-DD
				const date = new Date(stmt.date)
				const year = date.getUTCFullYear()
				const month = String(date.getUTCMonth() + 1).padStart(2, '0')
				const day = String(date.getUTCDate()).padStart(2, '0')
				return {
					id: stmt.id,
					category: stmt.category,
					type: stmt.type as 'income' | 'expense',
					amount: stmt.amount,
					description: stmt.description,
					date: `${year}-${month}-${day}`,
				}
			})
		}),
})
