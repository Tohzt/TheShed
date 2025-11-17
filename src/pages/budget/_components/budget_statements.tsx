import {useState, useMemo} from 'react'
import {api} from '../../../utils/api'
import type {BudgetCategory} from './budget_category'
import {Card} from '../../../store/components/ui/card'
import BudgetPopup from './budget_popup'
import ConfirmDeleteDialog from './delete_category_dialog'
import {DatePicker} from './date_picker'
import {Button} from '../../../store/components/ui/button'
import {ChevronUp, ChevronDown, Minus, Plus} from 'lucide-react'

export interface Statement {
	id: string
	category: string
	type: 'income' | 'expense'
	amount: number
	description: string
	date: string
}

interface AutomatedItem {
	id: string
	label: string
	amount: number
	type: 'income' | 'expense'
	dates: string[]
}

interface BudgetStatementsComponentProps {
	statements: Statement[]
	categories: BudgetCategory[]
	automatedItems: AutomatedItem[]
	onRefetch: () => void
	showFutureDates: boolean
	onFilterChange?: (showFutureDates: boolean) => void
}

export default function BudgetStatementsComponent({
	statements,
	categories,
	automatedItems,
	onRefetch,
	showFutureDates: showFutureDatesProp,
	onFilterChange,
}: BudgetStatementsComponentProps) {
	const [selectedStatement, setSelectedStatement] = useState<Statement | null>(
		null
	)
	const [editStatement, setEditStatement] = useState({
		type: 'expense' as 'income' | 'expense',
		category: '',
		amount: '',
		description: '',
		date: '',
	})
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [showAutomatedItemNotice, setShowAutomatedItemNotice] = useState(false)
	const [sortColumn, setSortColumn] = useState<
		'date' | 'category' | 'description' | 'amount' | null
	>(null)
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

	// Get today's date at start of day for comparison
	const getToday = () => {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		return today
	}

	// Check if a statement comes from an automated item
	const isStatementFromAutomatedItem = (statement: Statement): boolean => {
		return automatedItems.some((item) => {
			// Check if label, amount, and type match
			const matchesItem =
				item.label === statement.description &&
				item.amount === statement.amount &&
				item.type === statement.type

			if (!matchesItem) return false

			// Check if the statement's date is in the automated item's dates array
			return item.dates.includes(statement.date)
		})
	}

	// Separate statements into past/present and future when showing all
	const today = getToday()
	const pastPresentStatements: Statement[] = []
	const futureStatements: Statement[] = []

	statements.forEach((statement) => {
		// Parse YYYY-MM-DD as local date
		const [year, month, day] = statement.date.split('-').map(Number)
		const statementDate = new Date(year, month - 1, day)

		if (statementDate <= today) {
			pastPresentStatements.push(statement)
		} else {
			futureStatements.push(statement)
		}
	})

	// Filter statements based on showFutureDates
	const filteredStatements = showFutureDatesProp
		? [...pastPresentStatements, ...futureStatements]
		: pastPresentStatements

	// Sort statements based on sortColumn and sortDirection
	const sortedStatements = useMemo(() => {
		if (!sortColumn) return filteredStatements

		const sorted = [...filteredStatements].sort((a, b) => {
			let comparison = 0

			switch (sortColumn) {
				case 'date': {
					const [yearA, monthA, dayA] = a.date.split('-').map(Number)
					const [yearB, monthB, dayB] = b.date.split('-').map(Number)
					const dateA = new Date(yearA, monthA - 1, dayA)
					const dateB = new Date(yearB, monthB - 1, dayB)
					comparison = dateA.getTime() - dateB.getTime()
					break
				}
				case 'category': {
					const aIsAuto = isStatementFromAutomatedItem(a)
					const bIsAuto = isStatementFromAutomatedItem(b)

					// First, sort by whether it's automated (group automated items together)
					if (aIsAuto !== bIsAuto) {
						comparison = aIsAuto ? -1 : 1
					} else {
						// If both are automated or both are not, sort by category name
						comparison = a.category.localeCompare(b.category)
					}
					break
				}
				case 'description':
					comparison = a.description.localeCompare(b.description)
					break
				case 'amount': {
					// Convert to signed values: expenses are negative, income is positive
					const aValue = a.type === 'expense' ? -a.amount : a.amount
					const bValue = b.type === 'expense' ? -b.amount : b.amount
					comparison = aValue - bValue
					break
				}
			}

			return sortDirection === 'asc' ? comparison : -comparison
		})

		return sorted
	}, [filteredStatements, sortColumn, sortDirection])

	// Separate sorted statements back into past/present and future for divider
	const sortedPastPresentStatements: Statement[] = []
	const sortedFutureStatements: Statement[] = []

	sortedStatements.forEach((statement) => {
		// Parse YYYY-MM-DD as local date
		const [year, month, day] = statement.date.split('-').map(Number)
		const statementDate = new Date(year, month - 1, day)

		if (statementDate <= today) {
			sortedPastPresentStatements.push(statement)
		} else {
			sortedFutureStatements.push(statement)
		}
	})

	// Determine if we should show a divider (only when showing future dates and both groups exist)
	const showDivider =
		showFutureDatesProp &&
		sortedPastPresentStatements.length > 0 &&
		sortedFutureStatements.length > 0

	// Handle column header click for sorting
	const handleSort = (
		column: 'date' | 'category' | 'description' | 'amount'
	) => {
		if (sortColumn === column) {
			// Toggle direction if clicking the same column
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
		} else {
			// Set new column and default to ascending
			setSortColumn(column)
			setSortDirection('asc')
		}
	}

	// Mutation for updating statements
	const updateStatementMutation = api.budget.updateStatement.useMutation({
		onSuccess: () => {
			onRefetch()
			setSelectedStatement(null)
		},
	})

	// Mutation for deleting statements
	const deleteStatementMutation = api.budget.deleteStatement.useMutation({
		onSuccess: () => {
			onRefetch()
			setSelectedStatement(null)
			setShowDeleteDialog(false)
		},
	})

	// Handle clicking on a statement row
	const handleStatementClick = (statement: Statement) => {
		// Check if this statement comes from an automated item
		if (isStatementFromAutomatedItem(statement)) {
			setSelectedStatement(statement)
			setShowAutomatedItemNotice(true)
			return
		}

		// Otherwise, allow editing
		setSelectedStatement(statement)
		setEditStatement({
			type: statement.type,
			category: statement.category,
			amount: statement.amount.toString(),
			description: statement.description,
			date: statement.date,
		})
	}

	// Handle updating statement
	const handleUpdateStatement = () => {
		if (!selectedStatement) return

		if (
			!editStatement.amount ||
			!editStatement.description ||
			!editStatement.date
		)
			return

		updateStatementMutation.mutate({
			statementId: selectedStatement.id,
			category: editStatement.category,
			type: editStatement.type,
			amount: parseFloat(editStatement.amount),
			description: editStatement.description,
			date: editStatement.date,
		})
	}

	// Handle deleting statement
	const handleDeleteStatement = () => {
		if (!selectedStatement) return

		deleteStatementMutation.mutate({
			statementId: selectedStatement.id,
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
				<h2 className='text-2xl font-bold text-foreground'>Statements</h2>
			</div>

			{/* Recent Statements Table */}
			<Card className='overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='w-full'>
						<thead className='border-b border-border bg-muted/50'>
							<tr>
								<th
									className='cursor-pointer select-none px-6 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/70'
									onClick={() => handleSort('date')}
								>
									<div className='flex items-center gap-2'>
										<span>Date</span>
										{sortColumn === 'date' &&
											(sortDirection === 'asc' ? (
												<ChevronUp className='h-4 w-4' />
											) : (
												<ChevronDown className='h-4 w-4' />
											))}
									</div>
								</th>
								<th
									className='cursor-pointer select-none px-6 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/70'
									onClick={() => handleSort('amount')}
								>
									<div className='flex w-full items-center justify-start gap-2'>
										<span>Amount</span>
										{sortColumn === 'amount' &&
											(sortDirection === 'asc' ? (
												<ChevronUp className='h-4 w-4' />
											) : (
												<ChevronDown className='h-4 w-4' />
											))}
									</div>
								</th>
								<th
									className='cursor-pointer select-none px-6 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/70'
									onClick={() => handleSort('category')}
								>
									<div className='flex items-center gap-2'>
										<span>Category</span>
										{sortColumn === 'category' &&
											(sortDirection === 'asc' ? (
												<ChevronUp className='h-4 w-4' />
											) : (
												<ChevronDown className='h-4 w-4' />
											))}
									</div>
								</th>
								<th
									className='cursor-pointer select-none px-6 py-4 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted/70'
									onClick={() => handleSort('description')}
								>
									<div className='flex items-center gap-2'>
										<span>Description</span>
										{sortColumn === 'description' &&
											(sortDirection === 'asc' ? (
												<ChevronUp className='h-4 w-4' />
											) : (
												<ChevronDown className='h-4 w-4' />
											))}
									</div>
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-border'>
							{sortedStatements.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className='px-6 py-8 text-center text-muted-foreground'
									>
										{statements.length === 0
											? 'No statements yet'
											: 'No statements match the current filter'}
									</td>
								</tr>
							) : (
								<>
									{/* Past/Present Statements */}
									{(showFutureDatesProp
										? sortedPastPresentStatements
										: sortedStatements
									).map((statement) => (
										<tr
											key={statement.id}
											className='cursor-pointer transition-colors hover:bg-muted/50'
											onClick={() => handleStatementClick(statement)}
										>
											<td className='px-6 py-4 text-sm text-muted-foreground'>
												{(() => {
													// Parse YYYY-MM-DD as local date
													const [year, month, day] = statement.date
														.split('-')
														.map(Number)
													const date = new Date(year, month - 1, day)
													return date.toLocaleDateString('en-US', {
														month: 'short',
														day: 'numeric',
													})
												})()}
											</td>
											<td
												className={`px-6 py-4 text-right text-sm font-semibold tabular-nums ${
													statement.type === 'income'
														? 'text-green-600 dark:text-green-400'
														: 'text-foreground'
												} ${
													statement.type === 'expense'
														? 'text-red-600 dark:text-red-400'
														: 'text-foreground'
												}`}
											>
												<div className='max-w-[70px]'>
													{statement.type === 'income' ? '+' : '-'}$
													{statement.amount.toFixed(2)}
												</div>
											</td>
											<td className='px-6 py-4'>
												{isStatementFromAutomatedItem(statement) ? (
													<span
														className={`inline-flex w-28 items-center justify-center rounded-full border-2 px-3 py-1 text-sm font-medium transition-all ${
															statement.type === 'income'
																? 'border-green-500 text-green-500 dark:border-green-400 dark:text-green-400'
																: 'border-red-500 text-red-500 dark:border-red-400 dark:text-red-400'
														}`}
													>
														Auto
													</span>
												) : (
													<span
														className='inline-flex w-28 items-center justify-center truncate rounded-full px-3 py-1 text-sm font-medium transition-all'
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
													</span>
												)}
											</td>
											<td className='px-6 py-4 text-sm text-foreground'>
												{statement.description}
											</td>
										</tr>
									))}

									{/* Subtle Divider between past/present and future */}
									{showDivider && (
										<tr>
											<td
												colSpan={4}
												className='border-t border-dashed border-border/60 bg-muted/20 px-6 py-2'
											>
												<div className='flex items-center gap-2'>
													<div className='h-px flex-1 bg-border/40' />
													<span className='text-xs font-medium text-muted-foreground'>
														Upcoming
													</span>
													<div className='h-px flex-1 bg-border/40' />
												</div>
											</td>
										</tr>
									)}

									{/* Future Statements */}
									{showFutureDatesProp &&
										sortedFutureStatements.map((statement) => (
											<tr
												key={statement.id}
												className='cursor-pointer opacity-75 transition-colors hover:bg-muted/50'
												onClick={() => handleStatementClick(statement)}
											>
												<td className='px-6 py-4 text-sm text-muted-foreground'>
													{(() => {
														// Parse YYYY-MM-DD as local date
														const [year, month, day] = statement.date
															.split('-')
															.map(Number)
														const date = new Date(year, month - 1, day)
														return date.toLocaleDateString('en-US', {
															month: 'short',
															day: 'numeric',
														})
													})()}
												</td>
												<td
													className={`px-6 py-4 text-right text-sm font-semibold tabular-nums ${
														statement.type === 'income'
															? 'text-green-600 dark:text-green-400'
															: 'text-foreground'
													} ${
														statement.type === 'expense'
															? 'text-red-600 dark:text-red-400'
															: 'text-foreground'
													}`}
												>
													<div className='max-w-[70px]'>
														{statement.type === 'income' ? '+' : '-'}$
														{statement.amount.toFixed(2)}
													</div>
												</td>
												<td className='px-6 py-4'>
													{isStatementFromAutomatedItem(statement) ? (
														<span
															className={`inline-flex w-28 items-center justify-center rounded-full border-2 px-3 py-1 text-sm font-medium transition-all ${
																statement.type === 'income'
																	? 'border-green-500 text-green-500 dark:border-green-400 dark:text-green-400'
																	: 'border-red-500 text-red-500 dark:border-red-400 dark:text-red-400'
															}`}
														>
															Auto
														</span>
													) : (
														<span
															className='inline-flex w-28 items-center justify-center truncate rounded-full px-3 py-1 text-sm font-medium transition-all'
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
														</span>
													)}
												</td>
												<td className='px-6 py-4 text-sm text-foreground'>
													{statement.description}
												</td>
											</tr>
										))}
								</>
							)}
						</tbody>
					</table>
				</div>
			</Card>

			{/* Edit Statement Popup */}
			<BudgetPopup
				isOpen={!!selectedStatement}
				onClose={() => {
					setSelectedStatement(null)
					setEditStatement({
						type: 'expense',
						category: '',
						amount: '',
						description: '',
						date: '',
					})
				}}
				title='Edit Statement'
			>
				<div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
					<div>
						<label className='mb-2 block text-sm font-medium text-foreground'>
							Category
						</label>
						<select
							value={editStatement.category}
							onChange={(e) =>
								setEditStatement({
									...editStatement,
									category: e.target.value,
								})
							}
							className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-input/50 dark:bg-[#2a2a2a]'
						>
							{categories.map((cat) => (
								<option key={cat.name} value={cat.name}>
									{cat.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className='mb-2 block text-sm font-medium text-foreground'>
							Amount
						</label>
						<div className='flex items-center gap-2'>
							<input
								type='number'
								step='0.01'
								min='0.01'
								value={editStatement.amount}
								onChange={(e) =>
									setEditStatement({
										...editStatement,
										amount: e.target.value,
									})
								}
								className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-input/50 dark:bg-[#2a2a2a]'
							/>
							<button
								type='button'
								onClick={() =>
									setEditStatement({
										...editStatement,
										type:
											editStatement.type === 'income' ? 'expense' : 'income',
									})
								}
								className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
									editStatement.type === 'income'
										? 'border-green-500 bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400'
										: 'border-red-500 bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400'
								}`}
							>
								{editStatement.type === 'income' ? (
									<Plus className='h-5 w-5' />
								) : (
									<Minus className='h-5 w-5' />
								)}
							</button>
						</div>
					</div>
					<div>
						<label className='mb-2 block text-sm font-medium text-foreground'>
							Date
						</label>
						<DatePicker
							value={editStatement.date}
							onChange={(date) =>
								setEditStatement({
									...editStatement,
									date: date || '',
								})
							}
							placeholder='Select date'
							className='h-9'
						/>
					</div>
					<div className='sm:col-span-2'>
						<label className='mb-2 block text-sm font-medium text-foreground'>
							Description
						</label>
						<input
							type='text'
							value={editStatement.description}
							onChange={(e) =>
								setEditStatement({
									...editStatement,
									description: e.target.value,
								})
							}
							className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-input/50 dark:bg-[#2a2a2a]'
						/>
					</div>
				</div>
				<div className='flex flex-col gap-3'>
					<div className='flex gap-3'>
						<Button
							onClick={handleUpdateStatement}
							disabled={
								!editStatement.amount ||
								!editStatement.description ||
								!editStatement.date ||
								updateStatementMutation.status === 'loading'
							}
							className='flex-1'
						>
							{updateStatementMutation.status === 'loading'
								? 'Saving...'
								: 'Save Changes'}
						</Button>
						<Button
							onClick={() => {
								setSelectedStatement(null)
								setEditStatement({
									type: 'expense',
									category: '',
									amount: '',
									description: '',
									date: '',
								})
							}}
							variant='outline'
							className='flex-1'
						>
							Cancel
						</Button>
					</div>
					<Button
						onClick={() => setShowDeleteDialog(true)}
						variant='destructive'
						className='w-full'
						disabled={deleteStatementMutation.status === 'loading'}
					>
						{deleteStatementMutation.status === 'loading'
							? 'Deleting...'
							: 'Delete Statement'}
					</Button>
				</div>
			</BudgetPopup>

			{/* Delete Confirmation Dialog */}
			<ConfirmDeleteDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				title='Delete Statement'
				description={`Are you sure you want to delete this ${selectedStatement?.type} statement? This action cannot be undone.`}
				onConfirm={handleDeleteStatement}
				isDeleting={deleteStatementMutation.status === 'loading'}
			/>

			{/* Automated Item Notice Dialog */}
			<BudgetPopup
				isOpen={showAutomatedItemNotice}
				onClose={() => {
					setShowAutomatedItemNotice(false)
					setSelectedStatement(null)
				}}
				title='Automated Item'
			>
				<div className='space-y-4'>
					<p className='text-sm text-muted-foreground'>
						This statement was created from an automated item and cannot be
						edited directly.
					</p>
					<p className='text-sm text-muted-foreground'>
						To modify this item, please edit it in the{' '}
						<span className='font-semibold text-foreground'>
							Monthly Money editor
						</span>{' '}
						located in the Monthly Summary section above.
					</p>
					<div className='flex justify-end'>
						<Button
							onClick={() => {
								setShowAutomatedItemNotice(false)
								setSelectedStatement(null)
							}}
							className='flex-1 sm:flex-initial'
						>
							Got it
						</Button>
					</div>
				</div>
			</BudgetPopup>
		</div>
	)
}

// Prevent Next.js from treating this as a page
export function getServerSideProps() {
	return {
		notFound: true,
	}
}
