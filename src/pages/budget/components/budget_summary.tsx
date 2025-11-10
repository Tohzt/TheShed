interface BudgetSummaryProps {
	income: number
	totalSpent: number
	remaining: number
	savingsRate: string
}

export default function BudgetSummary({
	income,
	totalSpent,
	remaining,
	savingsRate,
}: BudgetSummaryProps) {
	return (
		<div className='mb-8 grid w-full max-w-6xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
			{/* Income Card */}
			<div className='rounded-2xl border-t-4 border-emerald-500 bg-white p-4 shadow-lg sm:p-6'>
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
	)
}
