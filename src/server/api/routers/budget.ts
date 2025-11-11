import {z} from 'zod'
import {createTRPCRouter, protectedProcedure} from '../trpc'

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

			// Get monthly budget (income)
			const monthlyBudget = await ctx.prisma.monthlybudget.findUnique({
				where: {
					userId_month_year: {
						userId,
						month,
						year,
					},
				},
			})

			// Get all budget categories for this user
			const categories = await ctx.prisma.budgetcategory.findMany({
				where: {userId},
				orderBy: {name: 'asc'},
			})

			// Get expenses for this month
			const startDate = new Date(year, month - 1, 1)
			const endDate = new Date(year, month, 0, 23, 59, 59)

			const expenses = await ctx.prisma.expense.findMany({
				where: {
					userId,
					date: {
						gte: startDate,
						lte: endDate,
					},
				},
				orderBy: {date: 'desc'},
				take: 50, // Limit to 50 most recent
			})

			// Calculate spent amount per category
			const categorySpent = new Map<string, number>()
			expenses.forEach((expense) => {
				const current = categorySpent.get(expense.category) || 0
				categorySpent.set(expense.category, current + expense.amount)
			})

			// Combine categories with spent amounts
			const categoriesWithSpent = categories.map((cat) => ({
				id: cat.id,
				name: cat.name,
				allocated: cat.allocated,
				spent: categorySpent.get(cat.name) || 0,
				icon: cat.icon,
				color: cat.color,
			}))

			return {
				income: monthlyBudget?.income ?? 0,
				categories: categoriesWithSpent,
				expenses: expenses.map((exp) => ({
					id: exp.id,
					category: exp.category,
					amount: exp.amount,
					description: exp.description,
					date: exp.date.toISOString().split('T')[0],
				})),
			}
		}),

	// Create or update monthly budget (income)
	setMonthlyIncome: protectedProcedure
		.input(
			z.object({
				month: z.number().min(1).max(12),
				year: z.number(),
				income: z.number().min(0),
			})
		)
		.mutation(async ({ctx, input}) => {
			const userId = ctx.session.user.id

			return await ctx.prisma.monthlybudget.upsert({
				where: {
					userId_month_year: {
						userId,
						month: input.month,
						year: input.year,
					},
				},
				update: {
					income: input.income,
				},
				create: {
					userId,
					month: input.month,
					year: input.year,
					income: input.income,
				},
			})
		}),

	// Create a new expense
	createExpense: protectedProcedure
		.input(
			z.object({
				category: z.string(),
				amount: z.number().min(0.01),
				description: z.string().min(1),
				date: z.string(), // ISO date string
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

			return await ctx.prisma.expense.create({
				data: {
					userId,
					categoryId: budgetCategory?.id,
					category: input.category,
					amount: input.amount,
					description: input.description,
					date: new Date(input.date),
				},
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

			return await ctx.prisma.budgetcategory.update({
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

	// Get historical budget data for charts (last 6 months)
	getHistoricalBudget: protectedProcedure
		.input(
			z.object({
				months: z.number().min(1).max(12).default(6),
			})
		)
		.query(async ({ctx, input}) => {
			const userId = ctx.session.user.id
			const now = new Date()
			const currentMonth = now.getMonth() + 1
			const currentYear = now.getFullYear()

			// Calculate date range
			const startDate = new Date(currentYear, currentMonth - input.months, 1)
			const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59)

			// Get all monthly budgets in range
			const startYear = startDate.getFullYear()
			const startMonth = startDate.getMonth() + 1
			const endYear = endDate.getFullYear()
			const endMonth = endDate.getMonth() + 1

			const monthlyBudgets = await ctx.prisma.monthlybudget.findMany({
				where: {
					userId,
					OR: [
						{
							year: {
								gt: startYear,
								lt: endYear,
							},
						},
						{
							year: startYear,
							month: {gte: startMonth},
						},
						{
							year: endYear,
							month: {lte: endMonth},
						},
					],
				},
				orderBy: [{year: 'asc'}, {month: 'asc'}],
			})

			// Get all expenses in range
			const expenses = await ctx.prisma.expense.findMany({
				where: {
					userId,
					date: {
						gte: startDate,
						lte: endDate,
					},
				},
			})

			// Generate data for each month
			const chartData = []
			for (let i = input.months - 1; i >= 0; i--) {
				const date = new Date(currentYear, currentMonth - i - 1, 1)
				const month = date.getMonth() + 1
				const year = date.getFullYear()
				const monthName = date.toLocaleString('default', {month: 'short'})

				// Get income for this month
				const monthlyBudget = monthlyBudgets.find(
					(mb) => mb.month === month && mb.year === year
				)
				const income = monthlyBudget?.income ?? 0

				// Calculate total spent for this month
				const monthStart = new Date(year, month - 1, 1)
				const monthEnd = new Date(year, month, 0, 23, 59, 59)
				const monthExpenses = expenses.filter(
					(exp) => exp.date >= monthStart && exp.date <= monthEnd
				)
				const totalSpent = monthExpenses.reduce(
					(sum, exp) => sum + exp.amount,
					0
				)

				const remaining = income - totalSpent
				const savingsRate =
					income > 0 ? ((remaining / income) * 100).toFixed(1) : '0.0'

				chartData.push({
					month: monthName,
					income,
					totalSpent,
					remaining,
					savingsRate: parseFloat(savingsRate),
				})
			}

			return chartData
		}),
})
