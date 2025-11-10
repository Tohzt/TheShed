import {useState, useMemo, useRef} from 'react'
import {useSession} from 'next-auth/react'
import {api} from '../../utils/api'

// Type Definitions
interface Expense {
	id: string
	category: string
	amount: number
	description: string
	date: string
}

interface BudgetCategory {
	id: string
	name: string
	allocated: number
	spent: number
	icon: string | null
	color: string | null
}

interface MonthlyData {
	income: number
	expenses: Expense[]
	categories: BudgetCategory[]
}

export default function BudgetPage() {
	const {data: sessionData} = useSession()
	const [showAddExpense, setShowAddExpense] = useState(false)
	const [showAddCategory, setShowAddCategory] = useState(false)
	const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(
		null
	)
	const [newExpense, setNewExpense] = useState({
		category: '',
		amount: '',
		description: '',
	})
	const [newCategory, setNewCategory] = useState({
		name: '',
		allocated: '',
		icon: '',
		color: '',
	})
	const [editCategory, setEditCategory] = useState({
		name: '',
		allocated: '',
		icon: '',
		color: '',
	})
	const newCategoryColorRef = useRef<HTMLInputElement>(null)
	const editCategoryColorRef = useRef<HTMLInputElement>(null)

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

	// Mutation for creating expenses
	const createExpenseMutation = api.budget.createExpense.useMutation({
		onSuccess: () => {
			void refetch()
			setNewExpense({category: '', amount: '', description: ''})
			setShowAddExpense(false)
		},
	})

	// Mutation for creating categories
	const createCategoryMutation = api.budget.createCategory.useMutation({
		onSuccess: () => {
			void refetch()
			setNewCategory({name: '', allocated: '', icon: '', color: ''})
			setShowAddCategory(false)
		},
	})

	// Mutation for updating categories
	const updateCategoryMutation = api.budget.updateCategory.useMutation({
		onSuccess: () => {
			void refetch()
			setEditingCategory(null)
			setEditCategory({name: '', allocated: '', icon: '', color: ''})
		},
	})

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

	// Handle adding expense
	const handleAddExpense = () => {
		if (!newExpense.amount || !newExpense.description || !newExpense.category)
			return

		if (!sessionData?.user?.id) return

		createExpenseMutation.mutate({
			category: newExpense.category,
			amount: parseFloat(newExpense.amount),
			description: newExpense.description,
			date: new Date().toISOString().split('T')[0],
		})
	}

	// Handle adding category
	const handleAddCategory = () => {
		if (!newCategory.name || !newCategory.allocated) return

		if (!sessionData?.user?.id) return

		createCategoryMutation.mutate({
			name: newCategory.name,
			allocated: parseFloat(newCategory.allocated),
			icon: newCategory.icon || null,
			color: newCategory.color || null,
		})
	}

	// Handle editing category - open edit form
	const handleEditCategory = (category: BudgetCategory) => {
		setEditingCategory(category)
		setEditCategory({
			name: category.name,
			allocated: category.allocated.toString(),
			icon: category.icon || '',
			color: category.color || '',
		})
		setShowAddCategory(false)
		setShowAddExpense(false)
	}

	// Handle updating category
	const handleUpdateCategory = () => {
		if (!editingCategory || !editCategory.name || !editCategory.allocated)
			return

		if (!sessionData?.user?.id) return

		updateCategoryMutation.mutate({
			categoryId: editingCategory.id,
			name: editCategory.name,
			allocated: parseFloat(editCategory.allocated),
			icon: editCategory.icon || null,
			color: editCategory.color || null,
		})
	}

	// Helper function to get color (handles both hex and legacy Tailwind classes)
	const getColorValue = (color: string | null): string => {
		if (!color) return '#10b981' // emerald-500 default

		// If it's already a hex color, return it
		if (color.startsWith('#')) return color

		// Legacy Tailwind class support (for existing data)
		const colorMap: Record<string, string> = {
			'bg-blue-300': '#93c5fd',
			'bg-blue-400': '#60a5fa',
			'bg-blue-500': '#3b82f6',
			'bg-emerald-300': '#6ee7b7',
			'bg-emerald-400': '#34d399',
			'bg-emerald-500': '#10b981',
			'bg-red-300': '#fca5a5',
			'bg-red-400': '#f87171',
			'bg-red-500': '#ef4444',
			'bg-purple-300': '#c4b5fd',
			'bg-purple-400': '#a78bfa',
			'bg-purple-500': '#a855f7',
			'bg-yellow-300': '#fde047',
			'bg-yellow-400': '#facc15',
			'bg-yellow-500': '#eab308',
			'bg-pink-300': '#f9a8d4',
			'bg-pink-400': '#f472b6',
			'bg-pink-500': '#ec4899',
		}

		return colorMap[color] || color
	}

	// Helper function to get darker shade for text color
	const getTextColor = (color: string | null): string => {
		if (!color) return '#059669' // emerald-600 default

		const baseColor = getColorValue(color)

		// If it's a hex color, darken it slightly
		if (baseColor.startsWith('#')) {
			// Simple darkening - convert to RGB and reduce brightness
			const hex = baseColor.replace('#', '')
			const r = parseInt(hex.substr(0, 2), 16)
			const g = parseInt(hex.substr(2, 2), 16)
			const b = parseInt(hex.substr(4, 2), 16)

			// Darken by 20%
			const darkerR = Math.max(0, Math.floor(r * 0.8))
			const darkerG = Math.max(0, Math.floor(g * 0.8))
			const darkerB = Math.max(0, Math.floor(b * 0.8))

			return `#${darkerR.toString(16).padStart(2, '0')}${darkerG
				.toString(16)
				.padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`
		}

		// Legacy Tailwind support
		const textColorMap: Record<string, string> = {
			'bg-blue-300': '#2563eb',
			'bg-blue-400': '#2563eb',
			'bg-blue-500': '#2563eb',
			'bg-emerald-300': '#059669',
			'bg-emerald-400': '#059669',
			'bg-emerald-500': '#059669',
			'bg-red-300': '#dc2626',
			'bg-red-400': '#dc2626',
			'bg-red-500': '#dc2626',
			'bg-purple-300': '#9333ea',
			'bg-purple-400': '#9333ea',
			'bg-purple-500': '#9333ea',
			'bg-yellow-300': '#ca8a04',
			'bg-yellow-400': '#ca8a04',
			'bg-yellow-500': '#ca8a04',
			'bg-pink-300': '#db2777',
			'bg-pink-400': '#db2777',
			'bg-pink-500': '#db2777',
		}

		return textColorMap[color] || '#059669'
	}

	// Get current month/year for display
	const currentDate = new Date()
	const monthName = currentDate.toLocaleString('default', {month: 'long'})
	const year = currentDate.getFullYear()

	// Show loading state
	if (loading) {
		return (
			<main className='min-h-screen overflow-x-hidden bg-gradient-to-t from-emerald-50 to-teal-100'>
				<div className='screen -center flex-col justify-start'>
					<div className='w-full flex-col gap-4 overflow-y-auto overflow-x-hidden p-4 pt-[55vw] sm:pt-[15vh]'>
						<div className='flex h-64 items-center justify-center'>
							<p className='text-lg text-gray-600'>Loading budget data...</p>
						</div>
					</div>
				</div>
			</main>
		)
	}

	// Show empty state if no data
	const hasData = data.categories.length > 0 || data.expenses.length > 0

	return (
		<main className='min-h-screen overflow-x-hidden bg-gradient-to-t from-emerald-50 to-teal-100'>
			<div className='screen -center flex-col justify-start'>
				<div className='w-full flex-col gap-4 overflow-y-auto overflow-x-hidden p-4 pt-[55vw] sm:pt-[15vh]'>
					{/* Header */}
					<div className='mb-8 w-full max-w-6xl'>
						<h1 className='mb-2 text-4xl font-bold text-gray-800 sm:text-5xl'>
							Budget Tracker
						</h1>
						<p className='text-lg text-gray-600'>
							{monthName} {year}
						</p>
					</div>

					{/* Empty State */}
					{!hasData && (
						<div className='mb-8 w-full max-w-6xl rounded-2xl bg-white p-12 text-center shadow-lg'>
							<p className='mb-4 text-xl text-gray-600'>
								No budget data yet. Get started by creating categories and
								adding expenses!
							</p>
						</div>
					)}

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
							<div className='flex gap-3'>
								<button
									onClick={() => setShowAddCategory(!showAddCategory)}
									className='rounded-lg bg-blue-600 px-6 py-2 font-medium text-white shadow-md transition-colors hover:bg-blue-700'
								>
									+ Create Category
								</button>
								<button
									onClick={() => setShowAddExpense(!showAddExpense)}
									className='rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white shadow-md transition-colors hover:bg-emerald-700'
									disabled={data.categories.length === 0}
								>
									+ Add Expense
								</button>
							</div>
						</div>

						{/* Add Category Form */}
						{showAddCategory && (
							<div className='mb-6 rounded-2xl bg-white p-6 shadow-lg'>
								<h3 className='mb-4 text-xl font-bold text-gray-800'>
									Create Category
								</h3>
								<div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
									<input
										type='text'
										placeholder='Category Name'
										value={newCategory.name}
										onChange={(e) =>
											setNewCategory({...newCategory, name: e.target.value})
										}
										className='rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
									/>
									<input
										type='number'
										placeholder='Allocated Amount'
										value={newCategory.allocated}
										onChange={(e) =>
											setNewCategory({
												...newCategory,
												allocated: e.target.value,
											})
										}
										className='rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
									/>
									<input
										type='text'
										placeholder='Icon (emoji)'
										value={newCategory.icon}
										onChange={(e) =>
											setNewCategory({...newCategory, icon: e.target.value})
										}
										className='rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
									/>
									<div className='relative'>
										<input
											ref={newCategoryColorRef}
											type='color'
											value={newCategory.color || '#10b981'}
											onChange={(e) =>
												setNewCategory({...newCategory, color: e.target.value})
											}
											className='absolute h-10 w-10 cursor-pointer opacity-0'
										/>
										<div
											className='h-10 w-10 cursor-pointer rounded-xl border border-gray-300'
											style={{
												backgroundColor: newCategory.color || '#10b981',
											}}
											onClick={() => newCategoryColorRef.current?.click()}
										/>
									</div>
								</div>
								<div className='flex gap-3'>
									<button
										onClick={handleAddCategory}
										disabled={!newCategory.name || !newCategory.allocated}
										className='flex-1 rounded-lg bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400'
									>
										Create
									</button>
									<button
										onClick={() => {
											setShowAddCategory(false)
											setNewCategory({
												name: '',
												allocated: '',
												icon: '',
												color: '',
											})
										}}
										className='flex-1 rounded-lg bg-gray-300 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-400'
									>
										Cancel
									</button>
								</div>
							</div>
						)}

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
										disabled={data.categories.length === 0}
									>
										<option value=''>Select Category</option>
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

						{/* Edit Category Form */}
						{editingCategory && (
							<div className='mb-6 rounded-2xl bg-white p-6 shadow-lg'>
								<h3 className='mb-4 text-xl font-bold text-gray-800'>
									Edit Category
								</h3>
								<div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
									<input
										type='text'
										placeholder='Category Name'
										value={editCategory.name}
										onChange={(e) =>
											setEditCategory({...editCategory, name: e.target.value})
										}
										className='rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
									/>
									<input
										type='number'
										placeholder='Allocated Amount'
										value={editCategory.allocated}
										onChange={(e) =>
											setEditCategory({
												...editCategory,
												allocated: e.target.value,
											})
										}
										className='rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
									/>
									<input
										type='text'
										placeholder='Icon (emoji)'
										value={editCategory.icon}
										onChange={(e) =>
											setEditCategory({...editCategory, icon: e.target.value})
										}
										className='rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
									/>
									<div className='relative'>
										<input
											ref={editCategoryColorRef}
											type='color'
											value={editCategory.color || '#10b981'}
											onChange={(e) =>
												setEditCategory({
													...editCategory,
													color: e.target.value,
												})
											}
											className='absolute h-10 w-10 cursor-pointer opacity-0'
										/>
										<div
											className='h-10 w-10 cursor-pointer rounded-xl border border-gray-300'
											style={{
												backgroundColor: editCategory.color || '#10b981',
											}}
											onClick={() => editCategoryColorRef.current?.click()}
										/>
									</div>
								</div>
								<div className='flex gap-3'>
									<button
										onClick={handleUpdateCategory}
										disabled={!editCategory.name || !editCategory.allocated}
										className='flex-1 rounded-lg bg-blue-600 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400'
									>
										Save Changes
									</button>
									<button
										onClick={() => {
											setEditingCategory(null)
											setEditCategory({
												name: '',
												allocated: '',
												icon: '',
												color: '',
											})
										}}
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
										key={category.id}
										onClick={() => handleEditCategory(category)}
										className='cursor-pointer rounded-2xl bg-white p-6 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl'
									>
										<div className='mb-4 flex items-center justify-between'>
											<div className='flex items-center gap-3'>
												{category.icon && (
													<span className='text-3xl'>{category.icon}</span>
												)}
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
														isOverBudget ? 'bg-red-500' : ''
													}`}
													style={{
														width: `${Math.min(percentage, 100)}%`,
														backgroundColor: isOverBudget
															? undefined
															: getColorValue(category.color),
													}}
												/>
											</div>
										</div>

										<div className='flex items-center justify-between'>
											<span className='text-sm text-gray-600'>
												{percentage.toFixed(0)}% used
											</span>
											<span
												className={`text-sm font-bold ${
													isOverBudget ? 'text-red-600' : ''
												}`}
												style={{
													color: isOverBudget
														? undefined
														: getTextColor(category.color),
												}}
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
										{data.expenses.length === 0 ? (
											<tr>
												<td
													colSpan={4}
													className='px-6 py-8 text-center text-gray-500'
												>
													No expenses yet
												</td>
											</tr>
										) : (
											data.expenses.map((expense) => (
												<tr
													key={expense.id}
													className='transition-colors hover:bg-gray-50'
												>
													<td className='px-6 py-4 text-sm text-gray-600'>
														{new Date(expense.date).toLocaleDateString(
															'en-US',
															{
																month: 'short',
																day: 'numeric',
															}
														)}
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
											))
										)}
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
