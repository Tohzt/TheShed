import {useState, useRef} from 'react'
import {useSession} from 'next-auth/react'
import {api} from '../../../utils/api'
import BudgetPopup from './budget_popup'
import ConfirmDeleteDialog from './delete_category_dialog'
import EmojiPicker from './emoji_picker'
import {Button} from '@store/components/ui/button'

export interface BudgetCategory {
	id: string
	name: string
	allocated: number
	spent: number
	icon: string | null
	color: string | null
}

interface BudgetCategoryComponentProps {
	categories: BudgetCategory[]
	onRefetch: () => void
}

// Helper function to get color value (defaults to emerald if not provided)
const getColorValue = (color: string | null): string => {
	return color || '#10b981'
}

// Helper function to get darker shade for text color
const getTextColor = (color: string | null): string => {
	if (!color) return '#059669'

	const hex = color.replace('#', '')
	const r = parseInt(hex.slice(0, 2), 16)
	const g = parseInt(hex.slice(2, 4), 16)
	const b = parseInt(hex.slice(4, 6), 16)

	const darkerR = Math.max(0, Math.floor(r * 0.8))
	const darkerG = Math.max(0, Math.floor(g * 0.8))
	const darkerB = Math.max(0, Math.floor(b * 0.8))

	return `#${darkerR.toString(16).padStart(2, '0')}${darkerG
		.toString(16)
		.padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`
}

export default function BudgetCategoryComponent({
	categories,
	onRefetch,
}: BudgetCategoryComponentProps) {
	const {data: sessionData} = useSession()
	const [showAddCategory, setShowAddCategory] = useState(false)
	const [selectedCategory, setSelectedCategory] =
		useState<BudgetCategory | null>(null)
	const [activeTab, setActiveTab] = useState<'edit' | 'expense'>('expense')
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)
	const [newCategory, setNewCategory] = useState({
		name: '',
		allocated: '',
		icon: '',
		color: '',
	})
	const [editCategory, setEditCategory] = useState({
		name: '',
		allocated: '',
		icon: '',
		color: '',
	})
	const [newExpense, setNewExpense] = useState({
		amount: '',
		description: '',
	})
	const newCategoryColorRef = useRef<HTMLInputElement>(null)
	const editCategoryColorRef = useRef<HTMLInputElement>(null)

	// Mutation for creating categories
	const createCategoryMutation = api.budget.createCategory.useMutation({
		onSuccess: () => {
			onRefetch()
			setNewCategory({name: '', allocated: '', icon: '', color: ''})
			setShowAddCategory(false)
		},
	})

	// Mutation for updating categories
	const updateCategoryMutation = api.budget.updateCategory.useMutation({
		onSuccess: () => {
			onRefetch()
			setSelectedCategory(null)
			setEditCategory({name: '', allocated: '', icon: '', color: ''})
		},
	})

	// Mutation for deleting categories
	const deleteCategoryMutation = api.budget.deleteCategory.useMutation({
		onSuccess: () => {
			onRefetch()
			setSelectedCategory(null)
			setEditCategory({name: '', allocated: '', icon: '', color: ''})
		},
	})

	// Mutation for creating expenses
	const createExpenseMutation = api.budget.createExpense.useMutation({
		onSuccess: () => {
			onRefetch()
			setNewExpense({amount: '', description: ''})
		},
	})

	// Handle adding category
	const handleAddCategory = () => {
		if (!newCategory.name || !newCategory.allocated) return

		if (!sessionData?.user?.id) return

		createCategoryMutation.mutate({
			name: newCategory.name,
			allocated: parseFloat(newCategory.allocated),
			icon: newCategory.icon || null,
			color: newCategory.color || null,
		})
	}

	// Handle clicking category card - open popup
	const handleCategoryClick = (category: BudgetCategory) => {
		setSelectedCategory(category)
		setEditCategory({
			name: category.name,
			allocated: category.allocated.toString(),
			icon: category.icon || '',
			color: category.color || '',
		})
		setActiveTab('expense')
		setNewExpense({amount: '', description: ''})
	}

	// Handle updating category
	const handleUpdateCategory = () => {
		if (!selectedCategory || !editCategory.name || !editCategory.allocated)
			return

		if (!sessionData?.user?.id) return

		updateCategoryMutation.mutate({
			categoryId: selectedCategory.id,
			name: editCategory.name,
			allocated: parseFloat(editCategory.allocated),
			icon: editCategory.icon || null,
			color: editCategory.color || null,
		})
	}

	// Handle adding expense
	const handleAddExpense = () => {
		if (!selectedCategory || !newExpense.amount || !newExpense.description)
			return

		if (!sessionData?.user?.id) return

		createExpenseMutation.mutate({
			category: selectedCategory.name,
			amount: parseFloat(newExpense.amount),
			description: newExpense.description,
			date: new Date().toISOString().split('T')[0],
		})
	}

	// Handle deleting category
	const handleDeleteCategory = () => {
		if (!selectedCategory || !sessionData?.user?.id) return

		deleteCategoryMutation.mutate({
			categoryId: selectedCategory.id,
		})
		setShowDeleteDialog(false)
	}

	return (
		<div className='mb-8 w-full max-w-6xl'>
			<div className='mb-6 flex items-center justify-between'>
				<h2 className='text-2xl font-bold text-foreground'>Categories</h2>
				<Button onClick={() => setShowAddCategory(!showAddCategory)}>
					Add New
				</Button>
			</div>

			{/* Add Category Popup */}
			<BudgetPopup
				isOpen={showAddCategory}
				onClose={() => {
					setShowAddCategory(false)
					setNewCategory({name: '', allocated: '', icon: '', color: ''})
				}}
				title='Create Category'
			>
				<div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					<input
						type='text'
						placeholder='Category Name'
						value={newCategory.name}
						onChange={(e) =>
							setNewCategory({...newCategory, name: e.target.value})
						}
						className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-input/50 dark:bg-[#2a2a2a]'
					/>
					<input
						type='number'
						placeholder='Allocated Amount'
						value={newCategory.allocated}
						onChange={(e) =>
							setNewCategory({
								...newCategory,
								allocated: e.target.value,
							})
						}
						className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-input/50 dark:bg-[#2a2a2a]'
					/>
					<div className='flex justify-around gap-4'>
						{/* Emoji Picker */}
						<EmojiPicker
							value={newCategory.icon}
							onChange={(emoji) =>
								setNewCategory({...newCategory, icon: emoji})
							}
							trigger={
								<button
									type='button'
									className='flex h-20 w-20 items-center justify-center rounded-xl border-2 border-input bg-muted/50 text-4xl transition-all hover:scale-105 hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
								>
									{newCategory.icon || '😀'}
								</button>
							}
						/>
						{/* Color Picker */}
						<div className='relative'>
							<input
								ref={newCategoryColorRef}
								type='color'
								value={newCategory.color || '#10b981'}
								onChange={(e) =>
									setNewCategory({...newCategory, color: e.target.value})
								}
								className='absolute h-20 w-20 cursor-pointer opacity-0'
							/>
							<div
								className='flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-input transition-all focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:scale-105 hover:border-primary'
								style={{
									backgroundColor: newCategory.color || '#10b981',
								}}
								onClick={() => newCategoryColorRef.current?.click()}
							/>
						</div>
					</div>
				</div>
				<div className='flex gap-3'>
					<Button
						onClick={handleAddCategory}
						disabled={!newCategory.name || !newCategory.allocated}
						className='flex-1'
					>
						Create
					</Button>
					<Button
						onClick={() => {
							setShowAddCategory(false)
							setNewCategory({
								name: '',
								allocated: '',
								icon: '',
								color: '',
							})
						}}
						variant='outline'
						className='flex-1'
					>
						Cancel
					</Button>
				</div>
			</BudgetPopup>

			{/* Category Popup */}
			<BudgetPopup
				isOpen={!!selectedCategory}
				onClose={() => {
					setSelectedCategory(null)
					setEditCategory({name: '', allocated: '', icon: '', color: ''})
					setNewExpense({amount: '', description: ''})
				}}
				title={selectedCategory?.name || 'Category'}
			>
				{/* Tabs */}
				<div className='mb-6 flex gap-2 border-b border-border'>
					<button
						onClick={() => setActiveTab('edit')}
						className={`px-4 py-2 font-medium transition-colors ${
							activeTab === 'edit'
								? 'border-b-2 border-primary text-primary'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						Edit Category
					</button>
					<button
						onClick={() => setActiveTab('expense')}
						className={`px-4 py-2 font-medium transition-colors ${
							activeTab === 'expense'
								? 'border-b-2 border-primary text-primary'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						Add Expense
					</button>
				</div>

				{/* Edit Category Tab */}
				{activeTab === 'edit' && (
					<>
						<div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
							<input
								type='text'
								placeholder='Category Name'
								value={editCategory.name}
								onChange={(e) =>
									setEditCategory({...editCategory, name: e.target.value})
								}
								className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-input/50 dark:bg-[#2a2a2a]'
							/>
							<input
								type='number'
								placeholder='Allocated Amount'
								value={editCategory.allocated}
								onChange={(e) =>
									setEditCategory({
										...editCategory,
										allocated: e.target.value,
									})
								}
								className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-input/50 dark:bg-[#2a2a2a]'
							/>
							<div className='flex justify-around gap-4'>
								{/* Emoji Picker */}
								<EmojiPicker
									value={editCategory.icon}
									onChange={(emoji) =>
										setEditCategory({...editCategory, icon: emoji})
									}
									trigger={
										<button
											type='button'
											className='flex h-20 w-20 items-center justify-center rounded-xl border-2 border-input bg-muted/50 text-4xl transition-all hover:scale-105 hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
										>
											{editCategory.icon || '😀'}
										</button>
									}
								/>
								{/* Color Picker */}
								<div className='relative'>
									<input
										ref={editCategoryColorRef}
										type='color'
										value={editCategory.color || '#10b981'}
										onChange={(e) =>
											setEditCategory({
												...editCategory,
												color: e.target.value,
											})
										}
										className='absolute h-20 w-20 cursor-pointer opacity-0'
									/>
									<div
										className='flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-input transition-all focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:scale-105 hover:border-primary'
										style={{
											backgroundColor: editCategory.color || '#10b981',
										}}
										onClick={() => editCategoryColorRef.current?.click()}
									/>
								</div>
							</div>
						</div>
						<div className='mb-4 flex flex-col gap-3'>
							<div className='flex gap-3'>
								<Button
									onClick={handleUpdateCategory}
									disabled={!editCategory.name || !editCategory.allocated}
									className='flex-1'
								>
									Save Changes
								</Button>
								<Button
									onClick={() => {
										setSelectedCategory(null)
										setEditCategory({
											name: '',
											allocated: '',
											icon: '',
											color: '',
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
								disabled={deleteCategoryMutation.status === 'loading'}
							>
								{deleteCategoryMutation.status === 'loading'
									? 'Deleting...'
									: 'Delete Category'}
							</Button>
						</div>
					</>
				)}

				{/* Add Expense Tab */}
				{activeTab === 'expense' && (
					<>
						<div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
							<input
								type='number'
								placeholder='Amount'
								value={newExpense.amount}
								onChange={(e) =>
									setNewExpense({...newExpense, amount: e.target.value})
								}
								className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-input/50 dark:bg-[#2a2a2a]'
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
								className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-input/50 dark:bg-[#2a2a2a]'
							/>
						</div>
						<div className='flex gap-3'>
							<Button
								onClick={handleAddExpense}
								disabled={!newExpense.amount || !newExpense.description}
								className='flex-1'
							>
								Add Expense
							</Button>
							<Button
								onClick={() => {
									setSelectedCategory(null)
									setNewExpense({amount: '', description: ''})
								}}
								variant='outline'
								className='flex-1'
							>
								Cancel
							</Button>
						</div>
					</>
				)}
			</BudgetPopup>

			{/* Delete Category Alert Dialog */}
			<ConfirmDeleteDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				title='Delete Category'
				itemName={selectedCategory?.name}
				onConfirm={handleDeleteCategory}
				isDeleting={deleteCategoryMutation.status === 'loading'}
			/>

			{/* Category Cards */}
			<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
				{categories.map((category) => {
					const percentage = (category.spent / category.allocated) * 100
					const isOverBudget = category.spent > category.allocated

					return (
						<div
							key={category.id}
							onClick={() => handleCategoryClick(category)}
							className='cursor-pointer overflow-hidden rounded-xl border bg-card shadow transition-all hover:scale-[1.02] hover:shadow-lg'
						>
							<div
								className='relative p-2 px-4 text-white'
								style={{
									backgroundColor: isOverBudget
										? '#ef4444' // red-500
										: getColorValue(category.color),
								}}
							>
								<div className='flex items-center gap-3'>
									{category.icon && (
										<span className='text-3xl'>{category.icon}</span>
									)}
									<h3 className='text-xl font-bold'>{category.name}</h3>
								</div>
							</div>
							<div className='p-6 pt-4'>
								<div className='mb-3'>
									<div className='mb-2 flex justify-between text-sm'>
										<span className='text-muted-foreground'>Spent</span>
										<span
											className={`font-bold ${
												isOverBudget ? 'text-destructive' : 'text-foreground'
											}`}
										>
											${category.spent} / ${category.allocated}
										</span>
									</div>

									{/* Progress Bar */}
									<div className='h-3 w-full overflow-hidden rounded-full bg-muted'>
										<div
											className={`h-full transition-all duration-500 ${
												isOverBudget ? 'bg-red-500' : ''
											}`}
											style={{
												width: `${Math.min(percentage, 100)}%`,
												backgroundColor: isOverBudget
													? undefined
													: getColorValue(category.color),
											}}
										/>
									</div>
								</div>

								<div className='flex items-center justify-between'>
									<span className='text-sm text-muted-foreground'>
										{percentage.toFixed(0)}% used
									</span>
									<span
										className={`text-sm font-bold ${
											isOverBudget ? 'text-destructive' : ''
										}`}
										style={{
											color: isOverBudget
												? undefined
												: getTextColor(category.color),
										}}
									>
										${(category.allocated - category.spent).toFixed(2)} left
									</span>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
