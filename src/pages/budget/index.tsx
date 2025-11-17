import {useMemo, useState, useEffect} from 'react'
import {useSession} from 'next-auth/react'
import {api} from '../../utils/api'
import BudgetCategoryComponent, {
	type BudgetCategory,
} from './_components/budget_category'
import BudgetStatementsComponent, {
	type Statement,
} from './_components/budget_statements'
import BudgetSummary from './_components/budget_summary'
import {useHeaderDrawer} from '../../contexts/HeaderDrawerContext'
import {Switch} from '@store/components/ui/switch'

interface MonthlyData {
	income: number
	automatedItems: Array<{
		id: string
		label: string
		amount: number
		type: 'income' | 'expense'
		dates: string[]
	}>
	statements: Statement[]
	categories: BudgetCategory[]
}

export default function BudgetPage() {
	const {data: sessionData} = useSession()
	const {setDrawerContent} = useHeaderDrawer()

	// State for selected month/year
	const [selectedMonth, setSelectedMonth] = useState<number>(
		new Date().getMonth() + 1
	)
	const [selectedYear, setSelectedYear] = useState<number>(
		new Date().getFullYear()
	)
	// State for filtering future dates in statements
	const [showFutureDates, setShowFutureDates] = useState(false)

	// Register drawer content when component mounts
	useEffect(() => {
		setDrawerContent(
			<div className='flex items-center gap-3'>
				<label
					htmlFor='show-future-dates-drawer'
					className='cursor-pointer text-sm font-medium text-white'
				>
					Show future transactions
				</label>
				<Switch
					id='show-future-dates-drawer'
					checked={showFutureDates}
					onCheckedChange={setShowFutureDates}
				/>
			</div>
		)

		// Cleanup: remove drawer content when component unmounts
		return () => {
			setDrawerContent(null)
		}
	}, [showFutureDates, setDrawerContent])

	// Sync mutation for automated items
	const syncMutation = api.budget.syncAutomatedItemsToStatements.useMutation({
		onSuccess: () => {
			// Refetch budget data after sync completes
			void refetch()
		},
	})

	// Fetch budget data from tRPC API
	const {
		data: budgetData,
		isLoading: loading,
		refetch,
	} = api.budget.getMonthlyBudget.useQuery(
		{
			month: selectedMonth,
			year: selectedYear,
		},
		{
			enabled: !!sessionData?.user?.id,
		}
	)

	// Sync automated items to statements on page load
	useEffect(() => {
		if (sessionData?.user?.id && !loading) {
			syncMutation.mutate()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionData?.user?.id]) // Only run once on mount when user is available
	// Transform API data to match component state
	const data: MonthlyData = useMemo(() => {
		if (!budgetData) {
			return {
				income: 0,
				automatedItems: [],
				statements: [],
				categories: [],
			}
		}

		// Filter statements to ensure they're within the selected month/year
		const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1)
		const endOfMonth = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999)

		const filteredStatements = (budgetData.statements ?? []).filter(
			(statement) => {
				// Parse YYYY-MM-DD as local date (not UTC)
				const [year, month, day] = statement.date.split('-').map(Number)
				const statementDate = new Date(year, month - 1, day)
				return statementDate >= startOfMonth && statementDate <= endOfMonth
			}
		)

		return {
			income: budgetData.income,
			automatedItems: (budgetData.automatedItems ?? []).map((item) => ({
				...item,
				type: item.type as 'income' | 'expense',
				dates: item.dates ?? [],
			})),
			statements: filteredStatements.map((stmt) => ({
				...stmt,
				type: stmt.type as 'income' | 'expense',
			})),
			categories: budgetData.categories,
		}
	}, [budgetData, selectedMonth, selectedYear])

	// Get today's date at start of day for comparison
	const getToday = () => {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		return today
	}

	// Filter statements based on showFutureDates
	// When showFutureDates is false, only include past/present transactions
	const filteredStatements = useMemo(() => {
		if (showFutureDates) {
			return data.statements
		}
		const today = getToday()
		return data.statements.filter((statement) => {
			// Parse YYYY-MM-DD as local date
			const [year, month, day] = statement.date.split('-').map(Number)
			const statementDate = new Date(year, month - 1, day)
			return statementDate <= today
		})
	}, [data.statements, showFutureDates])

	// Recalculate category totals based on filtered statements
	const categoriesWithFilteredTotals = useMemo(() => {
		// Calculate income and expenses per category from filtered statements
		const categoryIncome = new Map<string, number>()
		const categoryExpenses = new Map<string, number>()

		filteredStatements.forEach((statement) => {
			if (statement.type === 'income') {
				const current = categoryIncome.get(statement.category) || 0
				categoryIncome.set(statement.category, current + statement.amount)
			} else if (statement.type === 'expense') {
				const current = categoryExpenses.get(statement.category) || 0
				categoryExpenses.set(statement.category, current + statement.amount)
			}
		})

		// Update categories with filtered totals
		return data.categories.map((cat) => ({
			...cat,
			income: categoryIncome.get(cat.name) || 0,
			expense: categoryExpenses.get(cat.name) || 0,
		}))
	}, [data.categories, filteredStatements])

	// Calculate totals based on filtered statements (when filtering future dates)
	const totals = useMemo(() => {
		const totalAllocated = data.categories.reduce(
			(sum, cat) => sum + cat.allocated,
			0
		)

		// Calculate income and expenses from filtered statements
		const totalIncome = filteredStatements
			.filter((stmt) => stmt.type === 'income')
			.reduce((sum, stmt) => sum + stmt.amount, 0)
		const totalExpense = filteredStatements
			.filter((stmt) => stmt.type === 'expense')
			.reduce((sum, stmt) => sum + stmt.amount, 0)

		// Remaining is income minus expenses from statements
		const remaining = totalIncome - totalExpense
		const savingsRate =
			totalIncome > 0 ? ((remaining / totalIncome) * 100).toFixed(1) : '0.0'

		return {totalAllocated, totalIncome, totalExpense, remaining, savingsRate}
	}, [data.categories, filteredStatements])

	// Format selected month/year for display
	const monthName = new Date(selectedYear, selectedMonth - 1, 1).toLocaleString(
		'default',
		{month: 'long'}
	)

	// Generate month and year options
	const months = Array.from({length: 12}, (_, i) => {
		const date = new Date(selectedYear, i, 1)
		return {
			value: i + 1,
			label: date.toLocaleString('default', {month: 'long'}),
		}
	})

	const currentYear = new Date().getFullYear()
	const years = Array.from({length: 10}, (_, i) => currentYear - 5 + i)

	// Show loading state
	if (loading) {
		return (
			<main className='min-h-screen overflow-x-hidden bg-background'>
				<div className='screen -center flex-col justify-start'>
					<div className='w-full flex-col gap-4 overflow-y-auto overflow-x-hidden p-4 pt-8 sm:pt-[15vh]'>
						<div className='flex h-64 items-center justify-center'>
							<p className='text-lg text-muted-foreground'>
								Loading budget data...
							</p>
						</div>
					</div>
				</div>
			</main>
		)
	}

	// Show empty state if no data
	const hasData = data.categories.length > 0 || data.statements.length > 0

	return (
		<main className='min-h-screen overflow-x-hidden bg-background'>
			<div className='screen -center flex-col justify-start'>
				<div className='w-full flex-col items-center gap-4 overflow-y-auto overflow-x-hidden p-4 pt-20'>
					{/* Header */}
					<div className='mb-8 flex w-full max-w-6xl justify-end'>
						<div className='flex items-center justify-between gap-4'>
							<div className='flex items-center gap-2'>
								<select
									value={selectedMonth}
									onChange={(e) => setSelectedMonth(Number(e.target.value))}
									className='flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-input/50 dark:bg-[#2a2a2a]'
								>
									{months.map((month) => (
										<option key={month.value} value={month.value}>
											{month.label}
										</option>
									))}
								</select>
								<select
									value={selectedYear}
									onChange={(e) => setSelectedYear(Number(e.target.value))}
									className='flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-input/50 dark:bg-[#2a2a2a]'
								>
									{years.map((year) => (
										<option key={year} value={year}>
											{year}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Empty State */}
					{!hasData && (
						<div className='mb-8 w-full max-w-6xl rounded-xl border bg-card p-12 text-center shadow'>
							<p className='mb-4 text-xl text-muted-foreground'>
								No budget data yet. Get started by creating categories and
								adding expenses!
							</p>
						</div>
					)}

					{/* Monthly Summary Cards */}
					<BudgetSummary
						income={totals.totalIncome}
						automatedItems={data.automatedItems}
						totalExpense={totals.totalExpense}
						remaining={totals.remaining}
						savingsRate={totals.savingsRate}
						month={selectedMonth}
						year={selectedYear}
						onRefetch={() => void refetch()}
					/>

					{/* Divider */}
					<div className='my-8 w-full max-w-6xl border-t border-border' />

					{/* Category Breakdown */}
					<BudgetCategoryComponent
						categories={categoriesWithFilteredTotals}
						onRefetch={() => void refetch()}
					/>

					{/* Divider */}
					<div className='my-8 w-full max-w-6xl border-t border-border' />

					{/* Statements */}
					<BudgetStatementsComponent
						statements={data.statements}
						categories={data.categories}
						automatedItems={data.automatedItems}
						onRefetch={() => void refetch()}
						showFutureDates={showFutureDates}
					/>
				</div>
			</div>
		</main>
	)
}
