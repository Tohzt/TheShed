import {useState} from 'react'
import {api} from '../../../utils/api'
import BudgetPopup from './budget_popup'

interface BudgetSummaryProps {
	income: number
	totalSpent: number
	remaining: number
	savingsRate: string
	onRefetch: () => void
}

export default function BudgetSummary({
	income,
	totalSpent,
	remaining,
	savingsRate,
	onRefetch,
}: BudgetSummaryProps) {
	const [showEditIncome, setShowEditIncome] = useState(false)
	const [newIncome, setNewIncome] = useState('')

	// Get current month/year
	const currentDate = new Date()
	const month = currentDate.getMonth() + 1
	const year = currentDate.getFullYear()

	// Mutation for setting monthly income
	const setIncomeMutation = api.budget.setMonthlyIncome.useMutation({
		onSuccess: () => {
			onRefetch()
			setShowEditIncome(false)
			setNewIncome('')
		},
	})

	// Handle setting income
	const handleSetIncome = () => {
		const incomeValue = parseFloat(newIncome)
		if (isNaN(incomeValue) || incomeValue < 0) return

		setIncomeMutation.mutate({
			month,
			year,
			income: incomeValue,
		})
	}

	// Handle clicking on income card
	const handleIncomeClick = () => {
		setNewIncome(income.toString())
		setShowEditIncome(true)
	}

	return (
		<>
			<div className='mb-8 grid w-full max-w-6xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
				{/* Income Card */}
				<div
					onClick={handleIncomeClick}
					className='cursor-pointer rounded-2xl border-t-4 border-emerald-500 bg-white p-4 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl sm:p-6'
				>
					<div className='mb-2 flex items-center justify-between'>
						<span className='text-xs font-medium text-gray-600 sm:text-sm'>
							Monthly Income
						</span>
						<span className='text-xl sm:text-2xl'>💰</span>
					</div>
					<p className='text-2xl font-bold text-gray-800 sm:text-3xl'>
						${income.toLocaleString()}
					</p>
				</div>

				{/* Total Spent Card */}
				<div className='rounded-2xl border-t-4 border-red-500 bg-white p-4 shadow-lg sm:p-6'>
					<div className='mb-2 flex items-center justify-between'>
						<span className='text-xs font-medium text-gray-600 sm:text-sm'>
							Total Spent
						</span>
						<span className='text-xl sm:text-2xl'>💸</span>
					</div>
					<p className='text-2xl font-bold text-gray-800 sm:text-3xl'>
						${totalSpent.toLocaleString()}
					</p>
				</div>

				{/* Remaining Card */}
				<div className='rounded-2xl border-t-4 border-blue-500 bg-white p-4 shadow-lg sm:p-6'>
					<div className='mb-2 flex items-center justify-between'>
						<span className='text-xs font-medium text-gray-600 sm:text-sm'>
							Remaining
						</span>
						<span className='text-xl sm:text-2xl'>💵</span>
					</div>
					<p className='text-2xl font-bold text-gray-800 sm:text-3xl'>
						${remaining.toLocaleString()}
					</p>
				</div>

				{/* Savings Rate Card */}
				<div className='rounded-2xl border-t-4 border-purple-500 bg-white p-4 shadow-lg sm:p-6'>
					<div className='mb-2 flex items-center justify-between'>
						<span className='text-xs font-medium text-gray-600 sm:text-sm'>
							Savings Rate
						</span>
						<span className='text-xl sm:text-2xl'>📊</span>
					</div>
					<p className='text-2xl font-bold text-gray-800 sm:text-3xl'>
						{savingsRate}%
					</p>
				</div>
			</div>

			{/* Edit Income Popup */}
			<BudgetPopup
				isOpen={showEditIncome}
				onClose={() => {
					setShowEditIncome(false)
					setNewIncome('')
				}}
				title='Set Monthly Income'
			>
				<div className='mb-4'>
					<label className='mb-2 block text-sm font-medium text-gray-700'>
						Monthly Income
					</label>
					<input
						type='number'
						placeholder='Enter monthly income'
						value={newIncome}
						onChange={(e) => setNewIncome(e.target.value)}
						className='w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500'
						min='0'
						step='0.01'
					/>
				</div>
				<div className='flex gap-3'>
					<button
						onClick={handleSetIncome}
						disabled={!newIncome || parseFloat(newIncome) < 0}
						className='flex-1 rounded-lg bg-emerald-600 py-2 font-medium text-white transition-colors hover:bg-emerald-700 disabled:bg-gray-400'
					>
						Save
					</button>
					<button
						onClick={() => {
							setShowEditIncome(false)
							setNewIncome('')
						}}
						className='flex-1 rounded-lg bg-gray-300 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-400'
					>
						Cancel
					</button>
				</div>
			</BudgetPopup>
		</>
	)
}
