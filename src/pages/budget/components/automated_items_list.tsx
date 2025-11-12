import {useImperativeHandle, useState, forwardRef, useMemo} from 'react'
import {Trash2, X, Plus, Minus} from 'lucide-react'
import {api} from '../../../utils/api'
import {Button} from '@store/components/ui/button'
import {MultiDatePicker} from './multi_date_picker'

export interface AutomatedItem {
	id: string
	label: string
	amount: number
	type: 'income' | 'expense'
	dates: string[]
}

interface AutomatedItemsListProps {
	items: AutomatedItem[]
	month: number
	year: number
	onRefetch: () => void
	onNewItemValidityChange?: (valid: boolean) => void
	onEditingStateChange?: (opts: {active: boolean; valid: boolean}) => void
	activeTab?: 'income' | 'expense'
	onActiveTabChange?: (tab: 'income' | 'expense') => void
}

export type AutomatedItemsListHandle = {
	addNewItem: () => void
	saveEdits: () => Promise<void>
}

// Helper to parse YYYY-MM-DD string as local date (not UTC)
const parseDateLocal = (dateStr: string): Date => {
	const [year, month, day] = dateStr.split('-').map(Number)
	// Create date in local timezone - this ensures Nov 1 stays Nov 1
	return new Date(year, month - 1, day)
}

// Helper to format dates for display (month once, then just day numbers)
const formatDates = (dates: string[]): string => {
	if (dates.length === 0) return 'No dates'
	// Sort dates chronologically
	const sortedDates = [...dates].sort(
		(a, b) => parseDateLocal(a).getTime() - parseDateLocal(b).getTime()
	)
	// Get month abbreviation from first date
	const firstDate = parseDateLocal(sortedDates[0]!)
	const monthAbbr = firstDate.toLocaleDateString('en-US', {month: 'short'})
	// Get just the day numbers
	const dayNumbers = sortedDates
		.map((d) => parseDateLocal(d).getDate().toString())
		.join(', ')
	return `${monthAbbr} ${dayNumbers}`
}

const AutomatedItemsList = forwardRef<
	AutomatedItemsListHandle,
	AutomatedItemsListProps
>(function AutomatedItemsList(
	{
		items,
		month,
		year,
		onRefetch,
		onNewItemValidityChange,
		onEditingStateChange,
		activeTab: externalActiveTab,
		onActiveTabChange,
	},
	ref
) {
	const [internalActiveTab, setInternalActiveTab] = useState<
		'income' | 'expense'
	>('income')
	const activeTab = externalActiveTab ?? internalActiveTab
	const setActiveTab = onActiveTabChange ?? setInternalActiveTab
	const [editingId, setEditingId] = useState<string | null>(null)
	const [newIncomeItem, setNewIncomeItem] = useState({
		label: '',
		amount: '',
		dates: [] as string[],
	})
	const [newExpenseItem, setNewExpenseItem] = useState({
		label: '',
		amount: '',
		dates: [] as string[],
	})
	const [editingItem, setEditingItem] = useState({
		label: '',
		amount: '',
		type: 'income' as 'income' | 'expense',
		dates: [] as string[],
	})
	const [isIncomeFormExpanded, setIsIncomeFormExpanded] = useState(false)
	const [isExpenseFormExpanded, setIsExpenseFormExpanded] = useState(false)

	// Separate items by type
	const incomeItems = useMemo(
		() => items.filter((item) => item.type === 'income'),
		[items]
	)
	const expenseItems = useMemo(
		() => items.filter((item) => item.type === 'expense'),
		[items]
	)

	const createMutation = api.budget.createAutomatedItem.useMutation({
		onSuccess: (_, variables) => {
			onRefetch()
			// Clear the form that was actually used to create the item
			if (variables && 'type' in variables) {
				if (variables.type === 'income') {
					setNewIncomeItem({label: '', amount: '', dates: []})
					setIsIncomeFormExpanded(false)
				} else if (variables.type === 'expense') {
					setNewExpenseItem({label: '', amount: '', dates: []})
					setIsExpenseFormExpanded(false)
				}
			}
		},
	})

	const updateMutation = api.budget.updateAutomatedItem.useMutation({
		onSuccess: () => {
			onRefetch()
			setEditingId(null)
			setEditingItem({label: '', amount: '', type: 'income', dates: []})
		},
	})

	const deleteMutation = api.budget.deleteAutomatedItem.useMutation({
		onSuccess: () => {
			onRefetch()
		},
	})

	const handleCreate = () => {
		// Check which form has valid data (on desktop both are visible)
		const incomeValid =
			newIncomeItem.label &&
			newIncomeItem.amount &&
			newIncomeItem.dates.length > 0
		const expenseValid =
			newExpenseItem.label &&
			newExpenseItem.amount &&
			newExpenseItem.dates.length > 0

		// Prioritize based on activeTab, but if that form isn't valid, try the other
		let itemToCreate: {
			label: string
			amount: string
			dates: string[]
			type: 'income' | 'expense'
		} | null = null

		if (activeTab === 'income' && incomeValid) {
			itemToCreate = {...newIncomeItem, type: 'income' as const}
		} else if (activeTab === 'expense' && expenseValid) {
			itemToCreate = {...newExpenseItem, type: 'expense' as const}
		} else if (incomeValid) {
			// Fallback: if active tab form isn't valid, try the other
			itemToCreate = {...newIncomeItem, type: 'income' as const}
		} else if (expenseValid) {
			itemToCreate = {...newExpenseItem, type: 'expense' as const}
		}

		if (!itemToCreate) return

		createMutation.mutate({
			label: itemToCreate.label,
			amount: parseFloat(itemToCreate.amount),
			type: itemToCreate.type,
			month,
			year,
			dates: itemToCreate.dates,
		})
	}

	// Expose imperative methods for parent to trigger add and save edits
	useImperativeHandle(ref, () => ({
		addNewItem: handleCreate,
		saveEdits: async () => {
			if (!editingId) return
			if (
				!editingItem.label ||
				!editingItem.amount ||
				editingItem.dates.length === 0
			)
				return
			await updateMutation.mutateAsync({
				itemId: editingId,
				label: editingItem.label,
				amount: parseFloat(editingItem.amount),
				type: editingItem.type,
				dates: editingItem.dates,
			})
		},
	}))

	const handleUpdate = (itemId: string) => {
		if (
			!editingItem.label ||
			!editingItem.amount ||
			editingItem.dates.length === 0
		)
			return

		updateMutation.mutate({
			itemId,
			label: editingItem.label,
			amount: parseFloat(editingItem.amount),
			type: editingItem.type,
			dates: editingItem.dates,
		})
	}

	const handleDelete = (itemId: string) => {
		deleteMutation.mutate({itemId})
	}

	const startEditing = (item: AutomatedItem) => {
		setEditingId(item.id)
		setEditingItem({
			label: item.label,
			amount: item.amount.toString(),
			type: item.type,
			dates: [...item.dates],
		})
	}

	const cancelEditing = () => {
		setEditingId(null)
		setEditingItem({label: '', amount: '', type: 'income', dates: []})
	}

	const removeDateFromNewItem = (
		dateToRemove: string,
		type: 'income' | 'expense'
	) => {
		if (type === 'income') {
			setNewIncomeItem({
				...newIncomeItem,
				dates: newIncomeItem.dates.filter((d) => d !== dateToRemove),
			})
		} else {
			setNewExpenseItem({
				...newExpenseItem,
				dates: newExpenseItem.dates.filter((d) => d !== dateToRemove),
			})
		}
	}

	const removeDateFromEditingItem = (dateToRemove: string) => {
		setEditingItem({
			...editingItem,
			dates: editingItem.dates.filter((d) => d !== dateToRemove),
		})
	}

	// Track validity for parent to toggle footer primary action
	// Check both forms since on desktop both are visible
	const isNewValid = useMemo(() => {
		const incomeValid = Boolean(
			newIncomeItem.label &&
				newIncomeItem.amount &&
				newIncomeItem.dates.length > 0
		)
		const expenseValid = Boolean(
			newExpenseItem.label &&
				newExpenseItem.amount &&
				newExpenseItem.dates.length > 0
		)
		// Return true if either form is valid (on desktop both are visible)
		return incomeValid || expenseValid
	}, [newIncomeItem, newExpenseItem])
	onNewItemValidityChange?.(isNewValid)
	onEditingStateChange?.({
		active: Boolean(editingId),
		valid: Boolean(
			editingId &&
				editingItem.label &&
				editingItem.amount &&
				editingItem.dates.length > 0
		),
	})

	// Render a single item
	const renderItem = (item: AutomatedItem, isEditing: boolean) => {
		if (isEditing) {
			return (
				<div
					key={item.id}
					className={`space-y-3 rounded-md border-2 p-3 ${
						item.type === 'income'
							? 'border-green-700 bg-green-700/10 dark:bg-green-700/5'
							: 'border-red-700 bg-red-700/10 dark:bg-red-700/5'
					}`}
				>
					<div className='flex flex-wrap gap-2'>
						<input
							type='text'
							placeholder='Label'
							value={editingItem.label}
							onChange={(e) =>
								setEditingItem({...editingItem, label: e.target.value})
							}
							className='min-w-[9rem] flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm dark:border-input/50 dark:bg-[#1a1a1a]'
						/>
						<input
							type='number'
							placeholder='Amount'
							value={editingItem.amount}
							onChange={(e) =>
								setEditingItem({...editingItem, amount: e.target.value})
							}
							className='w-24 rounded-md border border-input bg-background px-3 py-1.5 text-sm dark:border-input/50 dark:bg-[#1a1a1a]'
							step='0.01'
							min='0'
						/>
					</div>

					{/* Dates section */}
					<div className='space-y-2'>
						{editingItem.dates.length > 0 && (
							<div className='flex flex-wrap gap-2'>
								{editingItem.dates.map((date) => (
									<div
										key={date}
										className='flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs'
									>
										<span>
											{parseDateLocal(date).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
											})}
										</span>
										<button
											type='button'
											onClick={() => removeDateFromEditingItem(date)}
											className='text-muted-foreground hover:text-foreground'
										>
											<X className='h-3 w-3' />
										</button>
									</div>
								))}
							</div>
						)}
						<MultiDatePicker
							value={editingItem.dates}
							onChange={(dates) => setEditingItem({...editingItem, dates})}
							placeholder='Select dates'
							month={month}
							year={year}
						/>
					</div>

					<div className='flex gap-2'>
						<Button
							size='sm'
							onClick={() => handleUpdate(item.id)}
							disabled={
								!editingItem.label ||
								!editingItem.amount ||
								editingItem.dates.length === 0
							}
							className='flex-1'
						>
							Save
						</Button>
						<Button
							size='sm'
							variant='outline'
							onClick={cancelEditing}
							className='flex-1'
						>
							Cancel
						</Button>
						<Button
							size='sm'
							variant='outline'
							onClick={() => {
								handleDelete(item.id)
								cancelEditing()
							}}
							className='flex-1 bg-destructive'
						>
							Delete
						</Button>
					</div>
				</div>
			)
		}

		return (
			<div
				key={item.id}
				onClick={() => startEditing(item)}
				className={`cursor-pointer rounded-md border bg-background px-3 py-1 transition-colors hover:bg-muted/50 dark:bg-[#2a2a2a] ${
					item.type === 'income' ? 'border-green-700' : 'border-red-700'
				}`}
			>
				<div className='flex min-w-0 flex-1 items-center gap-2'>
					<span className='shrink-0 truncate font-medium'>{item.label}</span>
					<span className='flex-1 text-xs text-muted-foreground'>
						{formatDates(item.dates)}
					</span>
					<span className='shrink-0 text-sm font-semibold text-foreground'>
						${item.amount.toLocaleString()}
					</span>
				</div>
			</div>
		)
	}

	// Render list for a specific type
	const renderList = (type: 'income' | 'expense', items: AutomatedItem[]) => {
		const isEditing = (item: AutomatedItem) => editingId === item.id
		const currentNewItem = type === 'income' ? newIncomeItem : newExpenseItem
		const setCurrentNewItem =
			type === 'income' ? setNewIncomeItem : setNewExpenseItem
		const isFormExpanded =
			type === 'income' ? isIncomeFormExpanded : isExpenseFormExpanded
		const setIsFormExpanded =
			type === 'income' ? setIsIncomeFormExpanded : setIsExpenseFormExpanded

		return (
			<div className='space-y-1.5'>
				{/* Existing Items */}
				{items.map((item) => renderItem(item, isEditing(item)))}

				{/* Add New Item */}
				{!isFormExpanded ? (
					<div
						onClick={() => setIsFormExpanded(true)}
						className={`cursor-pointer rounded-md border border-dashed bg-background px-3 py-1 transition-colors hover:bg-muted/50 dark:bg-[#2a2a2a] ${
							type === 'income' ? 'border-green-700' : 'border-red-700'
						}`}
					>
						<div className='flex min-w-0 flex-1 items-center gap-2'>
							<span className='shrink-0 truncate text-xs text-muted-foreground'>
								Add item...
							</span>
							<span className='flex-1'></span>
							<span className='shrink-0 text-xs text-muted-foreground'>$0</span>
						</div>
					</div>
				) : (
					<div className='space-y-3 rounded-md border border-dashed border-input bg-background p-3 dark:border-input/50 dark:bg-[#2a2a2a]'>
						<div className='flex flex-wrap gap-2'>
							<input
								type='text'
								placeholder='Add item...'
								value={currentNewItem.label}
								onChange={(e) =>
									setCurrentNewItem({...currentNewItem, label: e.target.value})
								}
								className='min-w-[9rem] flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground dark:border-input/50 dark:bg-[#1a1a1a] sm:min-w-[12rem]'
							/>
							<input
								type='number'
								placeholder='$0.00'
								value={currentNewItem.amount}
								onChange={(e) =>
									setCurrentNewItem({...currentNewItem, amount: e.target.value})
								}
								className='w-24 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground dark:border-input/50 dark:bg-[#1a1a1a]'
								step='0.01'
								min='0'
							/>
							<div className='flex-1'>
								<MultiDatePicker
									value={currentNewItem.dates}
									onChange={(dates) =>
										setCurrentNewItem({...currentNewItem, dates})
									}
									placeholder='Select dates'
									month={month}
									year={year}
								/>
							</div>
						</div>

						{/* Dates section */}
						<div className='space-y-2'>
							{currentNewItem.dates.length > 0 && (
								<div className='flex flex-wrap gap-2'>
									{currentNewItem.dates.map((date) => (
										<div
											key={date}
											className='flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs'
										>
											<span>
												{parseDateLocal(date).toLocaleDateString('en-US', {
													month: 'short',
													day: 'numeric',
												})}
											</span>
											<button
												type='button'
												onClick={() => removeDateFromNewItem(date, type)}
												className='text-muted-foreground hover:text-foreground'
											>
												<X className='h-3 w-3' />
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		)
	}

	return (
		<div className='w-full'>
			{/* Mobile: Single list based on active tab */}
			<div className='md:hidden'>
				{activeTab === 'income'
					? renderList('income', incomeItems)
					: renderList('expense', expenseItems)}
			</div>

			{/* Desktop: Side-by-side */}
			<div className='hidden md:grid md:grid-cols-2 md:gap-6'>
				<div>
					<h3 className='sticky top-0 z-10 mb-3 flex items-center gap-2 bg-card pb-2 text-lg font-semibold text-foreground dark:bg-[#1a1a1a]'>
						<span className='flex h-5 w-5 items-center justify-center rounded bg-green-500/20 text-green-600 dark:text-green-400'>
							<Plus className='h-3 w-3' />
						</span>
						<span>Income</span>
					</h3>
					{renderList('income', incomeItems)}
				</div>
				<div>
					<h3 className='sticky top-0 z-10 mb-3 flex items-center gap-2 bg-card pb-2 text-lg font-semibold text-foreground dark:bg-[#1a1a1a]'>
						<span className='flex h-5 w-5 items-center justify-center rounded bg-red-500/20 text-red-600 dark:text-red-400'>
							<Minus className='h-3 w-3' />
						</span>
						<span>Expenses</span>
					</h3>
					{renderList('expense', expenseItems)}
				</div>
			</div>
		</div>
	)
})

export default AutomatedItemsList
