import {useState, useRef} from 'react'
import {useSession} from 'next-auth/react'
import {api} from '../../../utils/api'
import BudgetPopup from './budget_popup'
import ConfirmDeleteDialog from './delete_category_dialog'
import EmojiPicker from './emoji_picker'
import {DatePicker} from './date_picker'
import {Button} from '../../../store/components/ui/button'
import {Minus, Plus, X} from 'lucide-react'

export interface BudgetCategory {
	id: string
	name: string
	allocated: number
	expense: number
	income: number
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
	// Helper to get today's date as YYYY-MM-DD (local, not UTC)
	const getTodayLocal = () => {
		const today = new Date()
		const year = today.getFullYear()
		const month = String(today.getMonth() + 1).padStart(2, '0')
		const day = String(today.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const [newExpense, setNewExpense] = useState({
		amount: '',
		description: '',
		date: getTodayLocal(), // Default to today (local date)
	})
	const [isIncome, setIsIncome] = useState(false) // false = expense (red -), true = income (green +)
	const [newCategoryHasBudget, setNewCategoryHasBudget] = useState(false)
	const [editCategoryHasBudget, setEditCategoryHasBudget] = useState(false)
	const newCategoryColorRef = useRef<HTMLInputElement>(null)
	const editCategoryColorRef = useRef<HTMLInputElement>(null)

	// Mutation for creating categories
	const createCategoryMutation = api.budget.createCategory.useMutation({
		onSuccess: () => {
			onRefetch()
			setNewCategory({name: '', allocated: '', icon: '', color: ''})
			setNewCategoryHasBudget(false)
			setShowAddCategory(false)
		},
	})

	// Mutation for updating categories
	const updateCategoryMutation = api.budget.updateCategory.useMutation({
		onSuccess: () => {
			onRefetch()
			setSelectedCategory(null)
			setEditCategory({name: '', allocated: '', icon: '', color: ''})
			setEditCategoryHasBudget(false)
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

	// Mutation for creating statements (expenses or income from categories)
	const createStatementMutation = api.budget.createStatement.useMutation({
		onSuccess: () => {
			onRefetch()
			setNewExpense({
				amount: '',
				description: '',
				date: getTodayLocal(),
			})
			setIsIncome(false) // Reset to expense by default
		},
	})

	// Handle adding category
	const handleAddCategory = () => {
		if (!newCategory.name) return
		if (newCategoryHasBudget && !newCategory.allocated) return

		if (!sessionData?.user?.id) return

		createCategoryMutation.mutate({
			name: newCategory.name,
			allocated: newCategoryHasBudget ? parseFloat(newCategory.allocated) : 0,
			icon: newCategory.icon || null,
			color: newCategory.color || null,
		})
	}

	// Handle clicking category card - open popup
	const handleCategoryClick = (category: BudgetCategory) => {
		setSelectedCategory(category)
		const hasBudget = category.allocated > 0
		setEditCategoryHasBudget(hasBudget)
		setEditCategory({
			name: category.name,
			allocated: hasBudget ? category.allocated.toString() : '',
			icon: category.icon || '',
			color: category.color || '',
		})
		setActiveTab('expense')
		setNewExpense({
			amount: '',
			description: '',
			date: new Date().toISOString().split('T')[0],
		})
		setIsIncome(false) // Reset to expense by default
	}

	// Handle updating category
	const handleUpdateCategory = () => {
		if (!selectedCategory || !editCategory.name) return
		if (editCategoryHasBudget && !editCategory.allocated) return

		if (!sessionData?.user?.id) return

		updateCategoryMutation.mutate({
			categoryId: selectedCategory.id,
			name: editCategory.name,
			allocated: editCategoryHasBudget ? parseFloat(editCategory.allocated) : 0,
			icon: editCategory.icon || null,
			color: editCategory.color || null,
		})
	}

	// Handle adding expense or income
	const handleAddExpense = () => {
		if (
			!selectedCategory ||
			!newExpense.amount ||
			!newExpense.description ||
			!newExpense.date
		)
			return

		if (!sessionData?.user?.id) return

		createStatementMutation.mutate({
			category: selectedCategory.name,
			type: isIncome ? 'income' : 'expense',
			amount: parseFloat(newExpense.amount),
			description: newExpense.description,
			date: newExpense.date,
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
					setNewCategoryHasBudget(false)
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
					{newCategoryHasBudget ? (
						<div className='flex items-center gap-2'>
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
							<button
								type='button'
								onClick={() => {
									setNewCategoryHasBudget(false)
									setNewCategory({...newCategory, allocated: ''})
								}}
								className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
							>
								<X className='h-4 w-4' />
							</button>
						</div>
					) : (
						<Button
							type='button'
							variant='outline'
							onClick={() => setNewCategoryHasBudget(true)}
							className='h-9'
						>
							Has a Budget?
						</Button>
					)}
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
						disabled={
							!newCategory.name ||
							(newCategoryHasBudget && !newCategory.allocated)
						}
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
							setNewCategoryHasBudget(false)
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
					setEditCategoryHasBudget(false)
					setNewExpense({
						amount: '',
						description: '',
						date: new Date().toISOString().split('T')[0],
					})
					setIsIncome(false) // Reset to expense by default
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
						Add to Statement
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
							{editCategoryHasBudget ? (
								<div className='flex items-center gap-2'>
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
									<button
										type='button'
										onClick={() => {
											setEditCategoryHasBudget(false)
											setEditCategory({...editCategory, allocated: ''})
										}}
										className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
									>
										<X className='h-4 w-4' />
									</button>
								</div>
							) : (
								<Button
									type='button'
									variant='outline'
									onClick={() => setEditCategoryHasBudget(true)}
									className='h-9'
								>
									Has a Budget?
								</Button>
							)}
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
									disabled={
										!editCategory.name ||
										(editCategoryHasBudget && !editCategory.allocated)
									}
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
										setEditCategoryHasBudget(false)
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
							<div className='flex items-center gap-2'>
								<button
									type='button'
									onClick={() => setIsIncome(!isIncome)}
									className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
										isIncome
											? 'border-green-500 bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400'
											: 'border-red-500 bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400'
									}`}
								>
									{isIncome ? (
										<Plus className='h-5 w-5' />
									) : (
										<Minus className='h-5 w-5' />
									)}
								</button>
								<input
									type='number'
									placeholder='Amount'
									value={newExpense.amount}
									onChange={(e) =>
										setNewExpense({...newExpense, amount: e.target.value})
									}
									className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-input/50 dark:bg-[#2a2a2a]'
								/>
							</div>
							<DatePicker
								value={newExpense.date}
								onChange={(date) =>
									setNewExpense({
										...newExpense,
										date: date || getTodayLocal(),
									})
								}
								placeholder='Select date'
								className='h-9'
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
								className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:border-input/50 dark:bg-[#2a2a2a] sm:col-span-2'
							/>
						</div>
						<div className='flex gap-3'>
							<Button
								onClick={handleAddExpense}
								disabled={
									!newExpense.amount ||
									!newExpense.description ||
									!newExpense.date
								}
								className='flex-1'
							>
								Add to Statement
							</Button>
							<Button
								onClick={() => {
									setSelectedCategory(null)
									setNewExpense({
										amount: '',
										description: '',
										date: new Date().toISOString().split('T')[0],
									})
									setIsIncome(false) // Reset to expense by default
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
					const hasBudget = category.allocated > 0
					const percentage = hasBudget
						? (category.expense / category.allocated) * 100
						: 0
					const isOverBudget =
						hasBudget && category.expense > category.allocated

					// For categories without budgets, calculate income/expense percentages
					const totalFlow = category.income + category.expense
					const incomePercent =
						totalFlow > 0 ? (category.income / totalFlow) * 100 : 0
					const expensePercent =
						totalFlow > 0 ? (category.expense / totalFlow) * 100 : 0
					const netAmount = category.income - category.expense

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
									{hasBudget ? (
										<>
											<div className='mb-2 flex justify-between text-sm'>
												<span className='text-muted-foreground'>Expense</span>
												<span
													className={`font-bold ${
														isOverBudget
															? 'text-destructive'
															: 'text-foreground'
													}`}
												>
													${category.expense.toFixed(2)} / $
													{category.allocated.toFixed(2)}
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
										</>
									) : (
										<>
											<div className='mb-2 flex justify-between text-sm'>
												<span className='text-muted-foreground'>
													Income / Expenses
												</span>
												<span className='font-bold text-foreground'>
													${category.income.toFixed(2)} / $
													{category.expense.toFixed(2)}
												</span>
											</div>

											{/* Income/Expense Bar */}
											<div className='h-3 w-full overflow-hidden rounded-full bg-muted'>
												{totalFlow > 0 ? (
													<div className='flex h-full'>
														{incomePercent > 0 && (
															<div
																className='h-full bg-green-500 transition-all duration-500'
																style={{width: `${incomePercent}%`}}
															/>
														)}
														{expensePercent > 0 && (
															<div
																className='h-full bg-red-500 transition-all duration-500'
																style={{width: `${expensePercent}%`}}
															/>
														)}
													</div>
												) : (
													<div className='h-full bg-muted' />
												)}
											</div>
										</>
									)}
								</div>

								<div className='flex items-center justify-between'>
									{hasBudget ? (
										<>
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
												${(category.allocated - category.expense).toFixed(2)}{' '}
												left
											</span>
										</>
									) : (
										<>
											<span className='text-sm font-bold text-green-600 dark:text-green-400'>
												+${category.income.toFixed(2)}
											</span>
											<span
												className={`text-sm font-bold ${
													netAmount >= 0
														? 'text-green-600 dark:text-green-400'
														: 'text-red-600 dark:text-red-400'
												}`}
											>
												{netAmount >= 0 ? '+' : ''}${netAmount.toFixed(2)}
											</span>
											<span className='text-sm font-bold text-red-600 dark:text-red-400'>
												-${category.expense.toFixed(2)}
											</span>
										</>
									)}
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

// Prevent Next.js from treating this as a page
export function getServerSideProps() {
	return {
		notFound: true,
	}
}
