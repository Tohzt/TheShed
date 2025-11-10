import {useState} from 'react'
import {api} from '../../../utils/api'
import BudgetPopup from './budget_popup'
import {Card, CardContent} from '@store/components/ui/card'
import {Button} from '@store/components/ui/button'

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
				<Card
					onClick={handleIncomeClick}
					className='cursor-pointer border-t-4 border-t-primary transition-all hover:scale-[1.02] hover:shadow-lg sm:p-6'
				>
					<CardContent className='p-4 sm:p-6'>
						<div className='mb-2 flex items-center justify-between'>
							<span className='text-xs font-medium text-muted-foreground sm:text-sm'>
								Monthly Income
							</span>
							<span className='text-xl sm:text-2xl'>💰</span>
						</div>
						<p className='text-2xl font-bold text-foreground sm:text-3xl'>
							${income.toLocaleString()}
						</p>
					</CardContent>
				</Card>

				{/* Total Spent Card */}
				<Card className='border-t-4 border-t-destructive sm:p-6'>
					<CardContent className='p-4 sm:p-6'>
						<div className='mb-2 flex items-center justify-between'>
							<span className='text-xs font-medium text-muted-foreground sm:text-sm'>
								Total Spent
							</span>
							<span className='text-xl sm:text-2xl'>💸</span>
						</div>
						<p className='text-2xl font-bold text-foreground sm:text-3xl'>
							${totalSpent.toLocaleString()}
						</p>
					</CardContent>
				</Card>

				{/* Remaining Card */}
				<Card className='border-t-4 border-t-chart-1 sm:p-6'>
					<CardContent className='p-4 sm:p-6'>
						<div className='mb-2 flex items-center justify-between'>
							<span className='text-xs font-medium text-muted-foreground sm:text-sm'>
								Remaining
							</span>
							<span className='text-xl sm:text-2xl'>💵</span>
						</div>
						<p className='text-2xl font-bold text-foreground sm:text-3xl'>
							${remaining.toLocaleString()}
						</p>
					</CardContent>
				</Card>

				{/* Savings Rate Card */}
				<Card className='border-t-4 border-t-chart-4 sm:p-6'>
					<CardContent className='p-4 sm:p-6'>
						<div className='mb-2 flex items-center justify-between'>
							<span className='text-xs font-medium text-muted-foreground sm:text-sm'>
								Savings Rate
							</span>
							<span className='text-xl sm:text-2xl'>📊</span>
						</div>
						<p className='text-2xl font-bold text-foreground sm:text-3xl'>
							{savingsRate}%
						</p>
					</CardContent>
				</Card>
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
					<label className='mb-2 block text-sm font-medium text-foreground'>
						Monthly Income
					</label>
					<input
						type='number'
						placeholder='Enter monthly income'
						value={newIncome}
						onChange={(e) => setNewIncome(e.target.value)}
						className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
						min='0'
						step='0.01'
					/>
				</div>
				<div className='flex gap-3'>
					<Button
						onClick={handleSetIncome}
						disabled={!newIncome || parseFloat(newIncome) < 0}
						className='flex-1'
					>
						Save
					</Button>
					<Button
						onClick={() => {
							setShowEditIncome(false)
							setNewIncome('')
						}}
						variant='outline'
						className='flex-1'
					>
						Cancel
					</Button>
				</div>
			</BudgetPopup>
		</>
	)
}
