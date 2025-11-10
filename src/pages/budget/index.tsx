import {useMemo} from 'react'
import {useSession} from 'next-auth/react'
import {api} from '../../utils/api'
import BudgetCategoryComponent, {
	type BudgetCategory,
} from './components/budget_category'
import BudgetExpenseComponent, {type Expense} from './components/budget_expense'
import BudgetSummary from './components/budget_summary'

interface MonthlyData {
	income: number
	expenses: Expense[]
	categories: BudgetCategory[]
}

export default function BudgetPage() {
	const {data: sessionData} = useSession()

	// Fetch budget data from tRPC API
	const {
		data: budgetData,
		isLoading: loading,
		refetch,
	} = api.budget.getMonthlyBudget.useQuery(
		{},
		{
			enabled: !!sessionData?.user?.id,
		}
	)
	// Transform API data to match component state
	const data: MonthlyData = useMemo(() => {
		if (!budgetData) {
			return {
				income: 0,
				expenses: [],
				categories: [],
			}
		}
		return {
			income: budgetData.income,
			expenses: budgetData.expenses,
			categories: budgetData.categories,
		}
	}, [budgetData])

	// Calculate totals
	const totals = useMemo(() => {
		const totalAllocated = data.categories.reduce(
			(sum, cat) => sum + cat.allocated,
			0
		)
		const totalSpent = data.categories.reduce((sum, cat) => sum + cat.spent, 0)
		const remaining = data.income - totalSpent
		const savingsRate =
			data.income > 0 ? ((remaining / data.income) * 100).toFixed(1) : '0.0'

		return {totalAllocated, totalSpent, remaining, savingsRate}
	}, [data])

	// Get current month/year for display
	const currentDate = new Date()
	const monthName = currentDate.toLocaleString('default', {month: 'long'})
	const year = currentDate.getFullYear()

	// Show loading state
	if (loading) {
		return (
			<main className='min-h-screen overflow-x-hidden bg-background'>
				<div className='screen -center flex-col justify-start'>
					<div className='w-full flex-col gap-4 overflow-y-auto overflow-x-hidden p-4 pt-[55vw] sm:pt-[15vh]'>
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
	const hasData = data.categories.length > 0 || data.expenses.length > 0

	return (
		<main className='min-h-screen overflow-x-hidden bg-background'>
			<div className='screen -center flex-col justify-start'>
				<div className='w-full flex-col items-center gap-4 overflow-y-auto overflow-x-hidden p-4 pt-[55vw] sm:pt-[15vh]'>
					{/* Header */}
					<div className='mb-8 w-full max-w-6xl'>
						<h1 className='mb-2 text-4xl font-bold text-foreground sm:text-5xl'>
							Budget Tracker
						</h1>
						<p className='text-lg text-muted-foreground'>
							{monthName} {year}
						</p>
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
						income={data.income}
						totalSpent={totals.totalSpent}
						remaining={totals.remaining}
						savingsRate={totals.savingsRate}
						onRefetch={() => void refetch()}
					/>

					{/* Divider */}
					<div className='my-8 w-full max-w-6xl border-t border-border' />

					{/* Category Breakdown */}
					<BudgetCategoryComponent
						categories={data.categories}
						onRefetch={() => void refetch()}
					/>

					{/* Divider */}
					<div className='my-8 w-full max-w-6xl border-t border-border' />

					{/* Expenses */}
					<BudgetExpenseComponent
						expenses={data.expenses}
						categories={data.categories}
						onRefetch={() => void refetch()}
					/>
				</div>
			</div>
		</main>
	)
}
