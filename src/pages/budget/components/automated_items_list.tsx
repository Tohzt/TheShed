import {useImperativeHandle, useState, forwardRef} from 'react'
import {Plus, Trash2, Edit2} from 'lucide-react'
import {api} from '../../../utils/api'
import {Button} from '@store/components/ui/button'

export interface AutomatedItem {
	id: string
	label: string
	amount: number
	type: 'income' | 'expense'
}

interface AutomatedItemsListProps {
	items: AutomatedItem[]
	month: number
	year: number
	onRefetch: () => void
	onNewItemValidityChange?: (valid: boolean) => void
	onEditingStateChange?: (opts: {active: boolean; valid: boolean}) => void
}

export type AutomatedItemsListHandle = {
	addNewItem: () => void
	saveEdits: () => Promise<void>
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
	},
	ref
) {
	const [editingId, setEditingId] = useState<string | null>(null)
	const [newItem, setNewItem] = useState({
		label: '',
		amount: '',
		type: 'income' as 'income' | 'expense',
	})
	const [editingItem, setEditingItem] = useState({
		label: '',
		amount: '',
		type: 'income' as 'income' | 'expense',
	})

	const createMutation = api.budget.createAutomatedItem.useMutation({
		onSuccess: () => {
			onRefetch()
			setNewItem({label: '', amount: '', type: 'income'})
		},
	})

	const updateMutation = api.budget.updateAutomatedItem.useMutation({
		onSuccess: () => {
			onRefetch()
			setEditingId(null)
		},
	})

	const deleteMutation = api.budget.deleteAutomatedItem.useMutation({
		onSuccess: () => {
			onRefetch()
		},
	})

	const handleCreate = () => {
		if (!newItem.label || !newItem.amount) return

		createMutation.mutate({
			label: newItem.label,
			amount: parseFloat(newItem.amount),
			type: newItem.type,
			month,
			year,
		})
	}

	// Expose imperative methods for parent to trigger add and save edits
	useImperativeHandle(ref, () => ({
		addNewItem: handleCreate,
		saveEdits: async () => {
			if (!editingId) return
			if (!editingItem.label || !editingItem.amount) return
			await updateMutation.mutateAsync({
				itemId: editingId,
				label: editingItem.label,
				amount: parseFloat(editingItem.amount),
				type: editingItem.type,
			})
		},
	}))

	const handleUpdate = (itemId: string) => {
		if (!editingItem.label || !editingItem.amount) return

		updateMutation.mutate({
			itemId,
			label: editingItem.label,
			amount: parseFloat(editingItem.amount),
			type: editingItem.type,
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
		})
	}

	const cancelEditing = () => {
		setEditingId(null)
		setEditingItem({label: '', amount: '', type: 'income'})
	}

	// Track validity for parent to toggle footer primary action
	const isNewValid = Boolean(newItem.label && newItem.amount)
	onNewItemValidityChange?.(isNewValid)
	onEditingStateChange?.({
		active: Boolean(editingId),
		valid: Boolean(editingId && editingItem.label && editingItem.amount),
	})

	return (
		<div className='space-y-2'>
			{/* Existing Items */}
			{items.map((item) => (
				<div
					key={item.id}
					className='flex flex-wrap items-center justify-between gap-2 rounded-md border border-input bg-background p-3 dark:border-input/50 dark:bg-[#2a2a2a]'
				>
					{editingId === item.id ? (
						<>
							<input
								type='text'
								placeholder='Label'
								value={editingItem.label}
								onChange={(e) =>
									setEditingItem({...editingItem, label: e.target.value})
								}
								className='w-[9rem] flex-shrink rounded-md border border-input bg-background px-3 py-1.5 text-sm dark:border-input/50 dark:bg-[#1a1a1a] sm:w-[12rem]'
							/>
							<input
								type='number'
								placeholder='Amount'
								value={editingItem.amount}
								onChange={(e) =>
									setEditingItem({...editingItem, amount: e.target.value})
								}
								className='w-20 rounded-md border border-input bg-background px-3 py-1.5 text-sm dark:border-input/50 dark:bg-[#1a1a1a]'
								step='0.01'
								min='0'
							/>
							<button
								type='button'
								onClick={() =>
									setEditingItem((prev) => ({
										...prev,
										type: prev.type === 'income' ? 'expense' : 'income',
									}))
								}
								aria-label='Toggle income/expense'
								className={`h-8 w-8 rounded-md border border-input text-sm font-medium dark:border-input/50 ${
									editingItem.type === 'income'
										? 'bg-green-500/20 text-green-600 dark:text-green-400'
										: 'bg-red-500/20 text-red-600 dark:text-red-400'
								}`}
							>
								{editingItem.type === 'income' ? '+' : '-'}
							</button>
						</>
					) : (
						<>
							<div className='flex flex-1 items-center gap-2'>
								<span
									className={`flex h-6 w-6 items-center justify-center rounded text-sm font-medium ${
										item.type === 'income'
											? 'bg-green-500/20 text-green-600 dark:text-green-400'
											: 'bg-red-500/20 text-red-600 dark:text-red-400'
									}`}
								>
									{item.type === 'income' ? '+' : '-'}
								</span>
								<span className='flex-1 font-medium'>{item.label}</span>
								<span className='text-sm text-muted-foreground'>
									${item.amount.toLocaleString()}
								</span>
							</div>
							<Button
								onClick={() => startEditing(item)}
								size='sm'
								variant='ghost'
								className='h-8 w-8 p-0'
							>
								<Edit2 className='h-4 w-4' />
							</Button>
							<Button
								onClick={() => handleDelete(item.id)}
								size='sm'
								variant='ghost'
								className='h-8 w-8 p-0 text-destructive hover:text-destructive'
							>
								<Trash2 className='h-4 w-4' />
							</Button>
						</>
					)}
				</div>
			))}

			{/* Add New Item */}
			<div className='flex items-center justify-between gap-2 rounded-md border border-dashed border-input bg-background p-3 dark:border-input/50 dark:bg-[#2a2a2a]'>
				<input
					type='text'
					placeholder='Add item...'
					value={newItem.label}
					onChange={(e) => setNewItem({...newItem, label: e.target.value})}
					className='w-[9rem] flex-shrink rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground dark:border-input/50 dark:bg-[#1a1a1a] sm:w-[12rem]'
				/>
				<input
					type='number'
					placeholder='$0.00'
					value={newItem.amount}
					onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
					className='w-20 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground dark:border-input/50 dark:bg-[#1a1a1a]'
					step='0.01'
					min='0'
				/>
				<button
					type='button'
					onClick={() =>
						setNewItem((prev) => ({
							...prev,
							type: prev.type === 'income' ? 'expense' : 'income',
						}))
					}
					aria-label='Toggle income/expense'
					className={`h-8 w-8 rounded-md border border-dashed border-input text-sm font-medium dark:border-input/50 ${
						newItem.type === 'income'
							? 'bg-green-500/20 text-green-600 dark:text-green-400'
							: 'bg-red-500/20 text-red-600 dark:text-red-400'
					}`}
				>
					{newItem.type === 'income' ? '+' : '-'}
				</button>
			</div>
		</div>
	)
})

export default AutomatedItemsList
