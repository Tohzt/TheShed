import {useState} from 'react'
import {api} from '../../../utils/api'
import type {BudgetCategory} from './budget_category'
import {Card} from '../../../store/components/ui/card'
import BudgetPopup from './budget_popup'
import ConfirmDeleteDialog from './delete_category_dialog'
import {DatePicker} from './date_picker'
import {Button} from '../../../store/components/ui/button'

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
}

export default function BudgetStatementsComponent({
	statements,
	categories,
	automatedItems,
	onRefetch,
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
										<td
											className={`px-6 py-4 text-right text-sm font-semibold ${
												statement.type === 'income'
													? 'text-green-600 dark:text-green-400'
													: 'text-foreground'
											} ${
												statement.type === 'expense'
													? 'text-red-600 dark:text-red-400'
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
								updateStatementMutation.isPending
							}
							className='flex-1'
						>
							{updateStatementMutation.isPending ? 'Saving...' : 'Save Changes'}
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
						disabled={deleteStatementMutation.isPending}
					>
						{deleteStatementMutation.isPending
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
				isDeleting={deleteStatementMutation.isPending}
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
