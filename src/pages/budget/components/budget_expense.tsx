import {useState} from 'react'
import {useSession} from 'next-auth/react'
import {api} from '../../../utils/api'
import type {BudgetCategory} from './budget_category'
import BudgetPopup from './budget_popup'

export interface Expense {
	id: string
	category: string
	amount: number
	description: string
	date: string
}

interface BudgetExpenseComponentProps {
	expenses: Expense[]
	categories: BudgetCategory[]
	onRefetch: () => void
}

export default function BudgetExpenseComponent({
	expenses,
	categories,
	onRefetch,
}: BudgetExpenseComponentProps) {
	const {data: sessionData} = useSession()
	const [showAddExpense, setShowAddExpense] = useState(false)
	const [newExpense, setNewExpense] = useState({
		category: '',
		amount: '',
		description: '',
	})

	// Mutation for creating expenses
	const createExpenseMutation = api.budget.createExpense.useMutation({
		onSuccess: () => {
			onRefetch()
			setNewExpense({category: '', amount: '', description: ''})
			setShowAddExpense(false)
		},
	})

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

	const getCategoryColor = (categoryName: string) => {
		const category = categories.find((cat) => cat.name === categoryName)
		return category?.color || '#10b981' // Default to emerald if not found
	}

	const darkenColor = (color: string): string => {
		const hex = color.replace('#', '')
		const r = parseInt(hex.slice(0, 2), 16)
		const g = parseInt(hex.slice(2, 4), 16)
		const b = parseInt(hex.slice(4, 6), 16)

		// Darken by 40%
		const darkR = Math.min(255, Math.floor(r + (255 - r) * 0.8))
		const darkG = Math.min(255, Math.floor(g + (255 - g) * 0.8))
		const darkB = Math.min(255, Math.floor(b + (255 - b) * 0.8))

		return `#${darkR.toString(16).padStart(2, '0')}${darkG
			.toString(16)
			.padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`
	}

	const lightenColor = (color: string): string => {
		const hex = color.replace('#', '')
		const r = parseInt(hex.slice(0, 2), 16)
		const g = parseInt(hex.slice(2, 4), 16)
		const b = parseInt(hex.slice(4, 6), 16)

		// Lighten by adding white (increase brightness by 80%)
		const lightR = Math.max(0, Math.floor(r * 0.6))
		const lightG = Math.max(0, Math.floor(g * 0.6))
		const lightB = Math.max(0, Math.floor(b * 0.6))

		return `#${lightR.toString(16).padStart(2, '0')}${lightG
			.toString(16)
			.padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`
	}

	return (
		<div className='mb-12 w-full max-w-6xl'>
			<div className='mb-6 flex items-center justify-between'>
				<h2 className='text-2xl font-bold text-gray-800'>Expenses</h2>
				<button
					onClick={() => setShowAddExpense(!showAddExpense)}
					className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-colors hover:bg-emerald-700 disabled:bg-gray-400'
					disabled={categories.length === 0}
				>
					Add New
				</button>
			</div>

			{/* Add Expense Popup */}
			<BudgetPopup
				isOpen={showAddExpense}
				onClose={() => {
					setShowAddExpense(false)
					setNewExpense({category: '', amount: '', description: ''})
				}}
				title='New Expense'
			>
				<div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
					<select
						value={newExpense.category}
						onChange={(e) =>
							setNewExpense({...newExpense, category: e.target.value})
						}
						className='rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500'
						disabled={categories.length === 0}
					>
						<option value=''>Select Category</option>
						{categories.map((cat) => (
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
						onClick={() => {
							setShowAddExpense(false)
							setNewExpense({category: '', amount: '', description: ''})
						}}
						className='flex-1 rounded-lg bg-gray-300 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-400'
					>
						Cancel
					</button>
				</div>
			</BudgetPopup>

			{/* Recent Expenses Table */}
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
							{expenses.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className='px-6 py-8 text-center text-gray-500'
									>
										No expenses yet
									</td>
								</tr>
							) : (
								expenses.map((expense) => (
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
											<span
												className='inline-flex items-center rounded-full px-3 py-1 text-sm font-medium'
												style={{
													backgroundColor: lightenColor(
														getCategoryColor(expense.category)
													),
													color: darkenColor(
														getCategoryColor(expense.category)
													),
												}}
											>
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
	)
}
