import {useState} from 'react'
import {api} from '../../../utils/api'
import type {BudgetCategory} from './budget_category'
import {Card} from '../../../store/components/ui/card'

export interface Statement {
	id: string
	category: string
	type: 'income' | 'expense'
	amount: number
	description: string
	date: string
}

interface BudgetExpenseComponentProps {
	statements: Statement[]
	categories: BudgetCategory[]
	onRefetch: () => void
}

export default function BudgetExpenseComponent({
	statements,
	categories,
	onRefetch,
}: BudgetExpenseComponentProps) {
	const [editingStatementId, setEditingStatementId] = useState<string | null>(
		null
	)

	// Mutation for updating statements
	const updateStatementMutation = api.budget.updateStatement.useMutation({
		onSuccess: () => {
			onRefetch()
			setEditingStatementId(null)
		},
	})

	// Handle category change
	const handleCategoryChange = (statementId: string, newCategory: string) => {
		updateStatementMutation.mutate({
			statementId,
			category: newCategory,
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
			<div className='mb-6'>
				<h2 className='text-2xl font-bold text-foreground'>Statements</h2>
			</div>

			{/* Recent Statements Table */}
			<Card className='overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead className='border-b border-border bg-muted/50'>
							<tr>
								<th className='px-6 py-4 text-left text-sm font-semibold text-foreground'>
									Date
								</th>
								<th className='px-6 py-4 text-left text-sm font-semibold text-foreground'>
									Type
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
							{statements.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className='px-6 py-8 text-center text-muted-foreground'
									>
										No statements yet
									</td>
								</tr>
							) : (
								statements.map((statement) => (
									<tr
										key={statement.id}
										className='transition-colors hover:bg-muted/50'
									>
										<td className='px-6 py-4 text-sm text-muted-foreground'>
											{new Date(statement.date).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
											})}
										</td>
										<td className='px-6 py-4'>
											<span
												className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
													statement.type === 'income'
														? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
														: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
												}`}
											>
												{statement.type === 'income' ? 'Income' : 'Expense'}
											</span>
										</td>
										<td className='px-6 py-4'>
											{editingStatementId === statement.id ? (
												<select
													value={statement.category}
													onChange={(e) => {
														handleCategoryChange(statement.id, e.target.value)
													}}
													onBlur={() => setEditingStatementId(null)}
													autoFocus
													className='cursor-pointer rounded-full border-0 px-3 py-1 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring dark:bg-[#2a2a2a]'
													style={{
														backgroundColor: lightenColor(
															getCategoryColor(statement.category)
														),
														color: darkenColor(
															getCategoryColor(statement.category)
														),
													}}
												>
													{categories.map((cat) => (
														<option
															key={cat.name}
															value={cat.name}
															style={{
																backgroundColor: lightenColor(
																	getCategoryColor(cat.name)
																),
																color: darkenColor(getCategoryColor(cat.name)),
															}}
														>
															{cat.name}
														</option>
													))}
												</select>
											) : (
												<button
													onClick={() => setEditingStatementId(statement.id)}
													className='inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
													style={{
														backgroundColor: lightenColor(
															getCategoryColor(statement.category)
														),
														color: darkenColor(
															getCategoryColor(statement.category)
														),
													}}
												>
													{statement.category}
												</button>
											)}
										</td>
										<td className='px-6 py-4 text-sm text-foreground'>
											{statement.description}
										</td>
										<td
											className={`px-6 py-4 text-right text-sm font-semibold ${
												statement.type === 'income'
													? 'text-green-600 dark:text-green-400'
													: 'text-foreground'
											}`}
										>
											{statement.type === 'income' ? '+' : '-'}$
											{statement.amount.toFixed(2)}
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

// Prevent Next.js from treating this as a page
export function getServerSideProps() {
	return {
		notFound: true,
	}
}
