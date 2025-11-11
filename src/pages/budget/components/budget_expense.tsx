import type {BudgetCategory} from './budget_category'
import {Card} from '@store/components/ui/card'

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
			<div className='mb-6'>
				<h2 className='text-2xl font-bold text-foreground'>Expenses</h2>
			</div>

			{/* Recent Expenses Table */}
			<Card className='overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead className='border-b border-border bg-muted/50'>
							<tr>
								<th className='px-6 py-4 text-left text-sm font-semibold text-foreground'>
									Date
								</th>
								<th className='px-6 py-4 text-left text-sm font-semibold text-foreground'>
									Category
								</th>
								<th className='px-6 py-4 text-left text-sm font-semibold text-foreground'>
									Description
								</th>
								<th className='px-6 py-4 text-right text-sm font-semibold text-foreground'>
									Amount
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-border'>
							{expenses.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className='px-6 py-8 text-center text-muted-foreground'
									>
										No expenses yet
									</td>
								</tr>
							) : (
								expenses.map((expense) => (
									<tr
										key={expense.id}
										className='transition-colors hover:bg-muted/50'
									>
										<td className='px-6 py-4 text-sm text-muted-foreground'>
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
										<td className='px-6 py-4 text-sm text-foreground'>
											{expense.description}
										</td>
										<td className='px-6 py-4 text-right text-sm font-semibold text-foreground'>
											${expense.amount.toFixed(2)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	)
}
