import {useState, useRef} from 'react'
import {useSession} from 'next-auth/react'
import {api} from '../../../utils/api'
import BudgetPopup from './budget_popup'
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
	const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(
		null
	)
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
			setEditingCategory(null)
			setEditCategory({name: '', allocated: '', icon: '', color: ''})
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

	// Handle editing category - open edit form
	const handleEditCategory = (category: BudgetCategory) => {
		setEditingCategory(category)
		setEditCategory({
			name: category.name,
			allocated: category.allocated.toString(),
			icon: category.icon || '',
			color: category.color || '',
		})
		setShowAddCategory(false)
	}

	// Handle updating category
	const handleUpdateCategory = () => {
		if (!editingCategory || !editCategory.name || !editCategory.allocated)
			return

		if (!sessionData?.user?.id) return

		updateCategoryMutation.mutate({
			categoryId: editingCategory.id,
			name: editCategory.name,
			allocated: parseFloat(editCategory.allocated),
			icon: editCategory.icon || null,
			color: editCategory.color || null,
		})
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
						className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
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
						className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
					/>
					<input
						type='text'
						placeholder='Icon (emoji)'
						value={newCategory.icon}
						onChange={(e) =>
							setNewCategory({...newCategory, icon: e.target.value})
						}
						className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
					/>
					<div className='relative'>
						<input
							ref={newCategoryColorRef}
							type='color'
							value={newCategory.color || '#10b981'}
							onChange={(e) =>
								setNewCategory({...newCategory, color: e.target.value})
							}
							className='absolute h-10 w-10 cursor-pointer opacity-0'
						/>
						<div
							className='h-10 w-10 cursor-pointer rounded-xl border border-input'
							style={{
								backgroundColor: newCategory.color || '#10b981',
							}}
							onClick={() => newCategoryColorRef.current?.click()}
						/>
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

			{/* Edit Category Popup */}
			<BudgetPopup
				isOpen={!!editingCategory}
				onClose={() => {
					setEditingCategory(null)
					setEditCategory({name: '', allocated: '', icon: '', color: ''})
				}}
				title='Edit Category'
			>
				<div className='mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					<input
						type='text'
						placeholder='Category Name'
						value={editCategory.name}
						onChange={(e) =>
							setEditCategory({...editCategory, name: e.target.value})
						}
						className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
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
						className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
					/>
					<input
						type='text'
						placeholder='Icon (emoji)'
						value={editCategory.icon}
						onChange={(e) =>
							setEditCategory({...editCategory, icon: e.target.value})
						}
						className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
					/>
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
							className='absolute h-10 w-10 cursor-pointer opacity-0'
						/>
						<div
							className='h-10 w-10 cursor-pointer rounded-xl border border-input'
							style={{
								backgroundColor: editCategory.color || '#10b981',
							}}
							onClick={() => editCategoryColorRef.current?.click()}
						/>
					</div>
				</div>
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
							setEditingCategory(null)
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
			</BudgetPopup>

			{/* Category Cards */}
			<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
				{categories.map((category) => {
					const percentage = (category.spent / category.allocated) * 100
					const isOverBudget = category.spent > category.allocated

					return (
						<div
							key={category.id}
							onClick={() => handleEditCategory(category)}
							className='cursor-pointer overflow-hidden rounded-xl border bg-card shadow transition-all hover:scale-[1.02] hover:shadow-lg'
						>
							<div
								className='p-2 px-4 text-white'
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
