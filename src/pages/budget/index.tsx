// src/pages/budget/index.tsx
import {useState, useMemo} from 'react'

// Type Definitions
interface Expense {
	id: string
	category: string
	amount: number
	description: string
	date: string
}

interface BudgetCategory {
	name: string
	allocated: number
	spent: number
	icon: string
	color: string
}

interface MonthlyData {
	income: number
	expenses: Expense[]
	categories: BudgetCategory[]
}

// Mock Data
const mockData: MonthlyData = {
	income: 5000,
	categories: [
		{
			name: 'Food',
			allocated: 800,
			spent: 645,
			icon: '🍽️',
			color: 'bg-emerald-500',
		},
		{
			name: 'Utilities',
			allocated: 300,
			spent: 285,
			icon: '💡',
			color: 'bg-blue-500',
		},
		{
			name: 'Entertainment',
			allocated: 400,
			spent: 320,
			icon: '🎮',
			color: 'bg-purple-500',
		},
		{
			name: 'Transportation',
			allocated: 500,
			spent: 475,
			icon: '🚗',
			color: 'bg-yellow-500',
		},
		{
			name: 'Healthcare',
			allocated: 200,
			spent: 150,
			icon: '🏥',
			color: 'bg-red-500',
		},
		{
			name: 'Shopping',
			allocated: 600,
			spent: 520,
			icon: '🛍️',
			color: 'bg-pink-500',
		},
	],
	expenses: [
		{
			id: '1',
			category: 'Food',
			amount: 45.5,
			description: 'Grocery shopping',
			date: '2025-11-08',
		},
		{
			id: '2',
			category: 'Transportation',
			amount: 60.0,
			description: 'Gas',
			date: '2025-11-07',
		},
		{
			id: '3',
			category: 'Entertainment',
			amount: 25.99,
			description: 'Movie tickets',
			date: '2025-11-06',
		},
	],
}

export default function BudgetPage() {
	const [data, setData] = useState<MonthlyData>(mockData)
	const [showAddExpense, setShowAddExpense] = useState(false)
	const [newExpense, setNewExpense] = useState({
		category: 'Food',
		amount: '',
		description: '',
	})

	// Calculate totals
	const totals = useMemo(() => {
		const totalAllocated = data.categories.reduce(
			(sum, cat) => sum + cat.allocated,
			0
		)
		const totalSpent = data.categories.reduce((sum, cat) => sum + cat.spent, 0)
		const remaining = data.income - totalSpent
		const savingsRate = ((remaining / data.income) * 100).toFixed(1)

		return {totalAllocated, totalSpent, remaining, savingsRate}
	}, [data])

	// Handle adding expense
	const handleAddExpense = () => {
		if (!newExpense.amount || !newExpense.description) return

		const expense: Expense = {
			id: Date.now().toString(),
			category: newExpense.category,
			amount: parseFloat(newExpense.amount),
			description: newExpense.description,
			date: new Date().toISOString().split('T')[0],
		}

		// Update category spent amount
		const updatedCategories = data.categories.map((cat) =>
			cat.name === newExpense.category
				? {...cat, spent: cat.spent + expense.amount}
				: cat
		)

		setData({
			...data,
			expenses: [expense, ...data.expenses],
			categories: updatedCategories,
		})

		setNewExpense({category: 'Food', amount: '', description: ''})
		setShowAddExpense(false)
	}

	return (
		<main className='min-h-screen overflow-x-hidden bg-gradient-to-t from-emerald-50 to-teal-100'>
			<div className='screen -center flex-col justify-start'>
				<div className='w-full flex-col gap-4 overflow-y-auto overflow-x-hidden p-4 pt-[55vw] sm:pt-[15vh]'>
					{/* Header */}
					<div className='mb-8 w-full max-w-6xl'>
						<h1 className='mb-2 text-4xl font-bold text-gray-800 sm:text-5xl'>
							Budget Tracker
						</h1>
						<p className='text-lg text-gray-600'>November 2025</p>
					</div>

					{/* Monthly Summary Cards */}
					<div className='mb-8 grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
						{/* Income Card */}
						<div className='rounded-2xl border-t-4 border-emerald-500 bg-white p-6 shadow-lg'>
							<div className='mb-2 flex items-center justify-between'>
								<span className='text-sm font-medium text-gray-600'>
									Monthly Income
								</span>
								<span className='text-2xl'>💰</span>
							</div>
							<p className='text-3xl font-bold text-gray-800'>
								${data.income.toLocaleString()}
							</p>
						</div>

						{/* Total Spent Card */}
						<div className='rounded-2xl border-t-4 border-red-500 bg-white p-6 shadow-lg'>
							<div className='mb-2 flex items-center justify-between'>
								<span className='text-sm font-medium text-gray-600'>
									Total Spent
								</span>
								<span className='text-2xl'>💸</span>
							</div>
							<p className='text-3xl font-bold text-gray-800'>
								${totals.totalSpent.toLocaleString()}
							</p>
						</div>

						{/* Remaining Card */}
						<div className='rounded-2xl border-t-4 border-blue-500 bg-white p-6 shadow-lg'>
							<div className='mb-2 flex items-center justify-between'>
								<span className='text-sm font-medium text-gray-600'>
									Remaining
								</span>
								<span className='text-2xl'>💵</span>
							</div>
							<p className='text-3xl font-bold text-gray-800'>
								${totals.remaining.toLocaleString()}
							</p>
						</div>

						{/* Savings Rate Card */}
						<div className='rounded-2xl border-t-4 border-purple-500 bg-white p-6 shadow-lg'>
							<div className='mb-2 flex items-center justify-between'>
								<span className='text-sm font-medium text-gray-600'>
									Savings Rate
								</span>
								<span className='text-2xl'>📊</span>
							</div>
							<p className='text-3xl font-bold text-gray-800'>
								{totals.savingsRate}%
							</p>
						</div>
					</div>

					{/* Category Breakdown */}
					<div className='mb-8 w-full max-w-6xl'>
						<div className='mb-6 flex items-center justify-between'>
							<h2 className='text-2xl font-bold text-gray-800'>Categories</h2>
							<button
								onClick={() => setShowAddExpense(!showAddExpense)}
								className='rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white shadow-md transition-colors hover:bg-emerald-700'
							>
								+ Add Expense
							</button>
						</div>

						{/* Add Expense Form */}
						{showAddExpense && (
							<div className='mb-6 rounded-2xl bg-white p-6 shadow-lg'>
								<h3 className='mb-4 text-xl font-bold text-gray-800'>
									New Expense
								</h3>
								<div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
									<select
										value={newExpense.category}
										onChange={(e) =>
											setNewExpense({...newExpense, category: e.target.value})
										}
										className='rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500'
									>
										{data.categories.map((cat) => (
											<option key={cat.name} value={cat.name}>
												{cat.name}
											</option>
										))}
									</select>
									<input
										type='number'
										placeholder='Amount'
										value={newExpense.amount}
										onChange={(e) =>
											setNewExpense({...newExpense, amount: e.target.value})
										}
										className='rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500'
									/>
									<input
										type='text'
										placeholder='Description'
										value={newExpense.description}
										onChange={(e) =>
											setNewExpense({
												...newExpense,
												description: e.target.value,
											})
										}
										className='rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500'
									/>
								</div>
								<div className='flex gap-3'>
									<button
										onClick={handleAddExpense}
										className='flex-1 rounded-lg bg-emerald-600 py-2 font-medium text-white transition-colors hover:bg-emerald-700'
									>
										Add
									</button>
									<button
										onClick={() => setShowAddExpense(false)}
										className='flex-1 rounded-lg bg-gray-300 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-400'
									>
										Cancel
									</button>
								</div>
							</div>
						)}

						{/* Category Cards */}
						<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
							{data.categories.map((category) => {
								const percentage = (category.spent / category.allocated) * 100
								const isOverBudget = category.spent > category.allocated

								return (
									<div
										key={category.name}
										className='rounded-2xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl'
									>
										<div className='mb-4 flex items-center justify-between'>
											<div className='flex items-center gap-3'>
												<span className='text-3xl'>{category.icon}</span>
												<h3 className='text-xl font-bold text-gray-800'>
													{category.name}
												</h3>
											</div>
										</div>

										<div className='mb-3'>
											<div className='mb-2 flex justify-between text-sm'>
												<span className='text-gray-600'>Spent</span>
												<span
													className={`font-bold ${
														isOverBudget ? 'text-red-600' : 'text-gray-800'
													}`}
												>
													${category.spent} / ${category.allocated}
												</span>
											</div>

											{/* Progress Bar */}
											<div className='h-3 w-full overflow-hidden rounded-full bg-gray-200'>
												<div
													className={`h-full transition-all duration-500 ${
														isOverBudget ? 'bg-red-500' : category.color
													}`}
													style={{width: `${Math.min(percentage, 100)}%`}}
												/>
											</div>
										</div>

										<div className='flex items-center justify-between'>
											<span className='text-sm text-gray-600'>
												{percentage.toFixed(0)}% used
											</span>
											<span
												className={`text-sm font-bold ${
													isOverBudget ? 'text-red-600' : 'text-emerald-600'
												}`}
											>
												${(category.allocated - category.spent).toFixed(2)} left
											</span>
										</div>
									</div>
								)
							})}
						</div>
					</div>

					{/* Recent Expenses */}
					<div className='mb-12 w-full max-w-6xl'>
						<h2 className='mb-6 text-2xl font-bold text-gray-800'>
							Recent Expenses
						</h2>
						<div className='overflow-hidden rounded-2xl bg-white shadow-lg'>
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead className='border-b border-gray-200 bg-gray-50'>
										<tr>
											<th className='px-6 py-4 text-left text-sm font-semibold text-gray-700'>
												Date
											</th>
											<th className='px-6 py-4 text-left text-sm font-semibold text-gray-700'>
												Category
											</th>
											<th className='px-6 py-4 text-left text-sm font-semibold text-gray-700'>
												Description
											</th>
											<th className='px-6 py-4 text-right text-sm font-semibold text-gray-700'>
												Amount
											</th>
										</tr>
									</thead>
									<tbody className='divide-y divide-gray-200'>
										{data.expenses.map((expense) => (
											<tr
												key={expense.id}
												className='transition-colors hover:bg-gray-50'
											>
												<td className='px-6 py-4 text-sm text-gray-600'>
													{new Date(expense.date).toLocaleDateString('en-US', {
														month: 'short',
														day: 'numeric',
													})}
												</td>
												<td className='px-6 py-4'>
													<span className='inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800'>
														{expense.category}
													</span>
												</td>
												<td className='px-6 py-4 text-sm text-gray-800'>
													{expense.description}
												</td>
												<td className='px-6 py-4 text-right text-sm font-semibold text-gray-800'>
													${expense.amount.toFixed(2)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
