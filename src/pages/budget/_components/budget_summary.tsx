import {useId, useState, useMemo, useRef, useEffect} from 'react'
import {Area, AreaChart, PieChart, Pie, Cell} from 'recharts'
import {Plus, Minus} from 'lucide-react'
import {api} from '../../../utils/api'
import BudgetPopup from './budget_popup'
import AutomatedItemsList, {
	type AutomatedItem,
	type AutomatedItemsListHandle,
} from './automated_items_list'
import {Card, CardContent} from '../../../store/components/ui/card'
import {Button} from '../../../store/components/ui/button'
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '../../../store/components/ui/chart'

interface BudgetSummaryProps {
	income: number
	automatedItems: AutomatedItem[]
	totalSpent: number
	remaining: number
	savingsRate: string
	month: number
	year: number
	onRefetch: () => void
}

export default function BudgetSummary({
	income,
	automatedItems,
	totalSpent,
	remaining,
	savingsRate,
	month,
	year,
	onRefetch,
}: BudgetSummaryProps) {
	const [showEditIncome, setShowEditIncome] = useState(false)
	const automatedListRef = useRef<AutomatedItemsListHandle | null>(null)
	const [canAddAutomatedItem, setCanAddAutomatedItem] = useState(false)
	const [hasActiveEdit, setHasActiveEdit] = useState(false)
	const [hasValidEdit, setHasValidEdit] = useState(false)
	const automatedListScrollRef = useRef<HTMLDivElement | null>(null)
	const [pendingScrollToEnd, setPendingScrollToEnd] = useState(false)
	const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income')

	// After an Add completes and items length changes, scroll to bottom once
	useEffect(() => {
		if (pendingScrollToEnd && automatedListScrollRef.current) {
			const el = automatedListScrollRef.current
			el.scrollTo({top: el.scrollHeight, behavior: 'smooth'})
			setPendingScrollToEnd(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [automatedItems.length])

	// Get unique IDs for gradients
	const spentGradientId = useId()
	const remainingGradientId = useId()
	const savingsGradientId = useId()

	// Prepare pie chart data
	const pieData = useMemo(() => {
		const data: Array<{name: string; value: number; color: string}> = []

		// Add income items
		automatedItems
			.filter((item) => item.type === 'income')
			.forEach((item) => {
				data.push({
					name: item.label,
					value: item.amount,
					color: 'hsl(var(--chart-2))',
				})
			})

		// Add expense items (as negative for visualization)
		automatedItems
			.filter((item) => item.type === 'expense')
			.forEach((item) => {
				data.push({
					name: item.label,
					value: item.amount,
					color: 'hsl(var(--destructive))',
				})
			})

		return data
	}, [automatedItems])

	// Chart configuration for pie chart
	const pieChartConfig = useMemo(() => {
		const config: ChartConfig = {}
		pieData.forEach((item, index) => {
			config[`item${index}`] = {
				label: item.name,
				color: item.color,
			}
		})
		return config
	}, [pieData])

	// Fetch historical data for charts
	const {data: historicalData = []} = api.budget.getHistoricalBudget.useQuery({
		months: 6,
	})

	const spentChartConfig = {
		value: {
			label: 'Spent',
			color: 'hsl(var(--destructive))',
		},
	} satisfies ChartConfig

	const remainingChartConfig = {
		value: {
			label: 'Remaining',
			color: 'hsl(var(--chart-1))',
		},
	} satisfies ChartConfig

	const savingsChartConfig = {
		value: {
			label: 'Savings Rate',
			color: 'hsl(var(--chart-4))',
		},
	} satisfies ChartConfig

	// Handle clicking on income card
	const handleIncomeClick = () => {
		setShowEditIncome(true)
	}

	// Long press handling for chart (mobile): tap opens popup, hold shows tooltip
	const longPressTimerRef = useRef<number | null>(null)
	const isLongPressRef = useRef(false)

	const handleChartTouchStart: React.TouchEventHandler<HTMLDivElement> = (
		e
	) => {
		isLongPressRef.current = false
		if (longPressTimerRef.current) {
			window.clearTimeout(longPressTimerRef.current)
		}
		longPressTimerRef.current = window.setTimeout(() => {
			isLongPressRef.current = true
			// When long-pressing, prevent the Card's click from firing
			// We don't stop propagation here to allow the chart to receive touch events for tooltip
		}, 350)
	}

	const handleChartTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
		if (longPressTimerRef.current) {
			window.clearTimeout(longPressTimerRef.current)
			longPressTimerRef.current = null
		}
		// If it was a long press, prevent the Card's click (popup) from triggering
		if (isLongPressRef.current) {
			e.stopPropagation()
		}
	}

	const handleChartClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
		// If a long press occurred, suppress click bubbling to the Card
		if (isLongPressRef.current) {
			e.stopPropagation()
			// reset so subsequent taps behave normally
			isLongPressRef.current = false
		}
	}

	return (
		<>
			<div className='mb-8 grid w-full max-w-6xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-4'>
				{/* Income Card */}
				<Card
					onClick={handleIncomeClick}
					className='relative h-[200px] cursor-pointer overflow-hidden border-t-4 border-t-primary transition-all hover:shadow-lg'
				>
					<CardContent className='relative h-full p-4 sm:pb-2 sm:pr-2'>
						{/* Chart and Ledger */}
						{pieData.length > 0 ? (
							<>
								{/* Mobile Layout */}
								<div className='relative z-10 md:hidden'>
									{/* Header */}
									<span className='pb-2 text-xl font-medium text-muted-foreground'>
										Monthly Money
									</span>
									{/* Mobile Chart */}
									<div
										className='flex justify-center'
										onTouchStart={handleChartTouchStart}
										onTouchEnd={handleChartTouchEnd}
										onClick={handleChartClick}
									>
										<ChartContainer
											config={pieChartConfig}
											className='h-[160px] w-[160px] [&>div]:!h-full [&>div]:!w-full'
										>
											<PieChart>
												<Pie
													data={pieData}
													cx='50%'
													cy='50%'
													innerRadius={30}
													outerRadius={70}
													paddingAngle={1}
													dataKey='value'
												>
													{pieData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.color} />
													))}
												</Pie>
												<ChartTooltip
													cursor={false}
													content={<ChartTooltipContent hideLabel />}
												/>
											</PieChart>
										</ChartContainer>
									</div>
								</div>

								{/* Desktop Layout: Left (Header + Chart) | Right (Ledger) */}
								<div className='relative z-10 hidden h-full gap-4 md:flex'>
									{/* Left: Header + Pie Chart */}
									<div className='flex flex-shrink-0 flex-col'>
										{/* Header */}
										<span className='pb-1 text-xl font-medium text-muted-foreground'>
											Monthly Money
										</span>
										{/* Pie Chart */}
										<div
											className='flex-1'
											onTouchStart={handleChartTouchStart}
											onTouchEnd={handleChartTouchEnd}
											onClick={handleChartClick}
										>
											<ChartContainer
												config={pieChartConfig}
												className='h-[140px] w-[140px] [&>div]:!h-full [&>div]:!w-full'
											>
												<PieChart>
													<Pie
														data={pieData}
														cx='50%'
														cy='50%'
														innerRadius={35}
														outerRadius={70}
														paddingAngle={1}
														dataKey='value'
													>
														{pieData.map((entry, index) => (
															<Cell key={`cell-${index}`} fill={entry.color} />
														))}
													</Pie>
													<ChartTooltip
														cursor={false}
														content={<ChartTooltipContent hideLabel />}
													/>
												</PieChart>
											</ChartContainer>
										</div>
									</div>

									{/* Right: Ledger (Full Height) */}
									<div className='flex-1 space-y-1.5 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
										{automatedItems
											.filter((item) => item.type === 'income')
											.map((item) => {
												const pieItem = pieData.find(
													(p) => p.name === item.label
												)
												return (
													<div
														key={item.id}
														className='flex items-center justify-between px-2.5 py-0'
													>
														<div className='flex min-w-0 items-center gap-2'>
															<div
																className='h-3 w-3 rounded-full'
																style={{
																	backgroundColor:
																		pieItem?.color || 'hsl(var(--chart-2))',
																}}
															/>
															<span className='max-w-[220px] truncate text-sm font-medium leading-tight text-foreground'>
																{item.label}
															</span>
														</div>
														<span className='ml-2 shrink-0 text-sm font-semibold text-green-600 dark:text-green-400'>
															+${item.amount.toLocaleString()}
														</span>
													</div>
												)
											})}
										{automatedItems
											.filter((item) => item.type === 'expense')
											.map((item) => {
												const pieItem = pieData.find(
													(p) => p.name === item.label
												)
												return (
													<div
														key={item.id}
														className='flex items-center justify-between px-2.5 py-0'
													>
														<div className='flex min-w-0 items-center gap-2'>
															<div
																className='h-3 w-3 rounded-full'
																style={{
																	backgroundColor:
																		pieItem?.color || 'hsl(var(--destructive))',
																}}
															/>
															<span className='max-w-[220px] truncate text-sm font-medium leading-tight text-foreground'>
																{item.label}
															</span>
														</div>
														<span className='ml-2 shrink-0 text-sm font-semibold text-red-600 dark:text-red-400'>
															-${item.amount.toLocaleString()}
														</span>
													</div>
												)
											})}
										{pieData.length === 0 && (
											<div className='text-center text-xs text-muted-foreground'>
												No items configured
											</div>
										)}
									</div>
								</div>
							</>
						) : (
							<div className='relative z-10 flex h-[140px] items-center justify-center text-sm text-muted-foreground'>
								Click to configure income
							</div>
						)}
					</CardContent>
				</Card>

				{/* Total Spent Card */}
				<Card className='relative min-h-[200px] overflow-hidden border-t-4 border-t-destructive transition-all hover:shadow-lg'>
					<CardContent className='relative h-full p-4'>
						<span className='flex justify-center text-2xl font-medium text-muted-foreground'>
							Total Spent
						</span>
						<p className='flex justify-center text-2xl font-bold text-foreground sm:text-3xl'>
							${totalSpent.toLocaleString()}
						</p>
						<ChartContainer
							config={spentChartConfig}
							className='absolute bottom-0 left-0 right-0 top-[50%] h-[50%] w-full overflow-hidden [&>div]:!h-full [&>div]:!w-full'
						>
							<AreaChart
								data={historicalData}
								margin={{left: 0, right: 0, top: 0, bottom: 0}}
							>
								<defs>
									<linearGradient
										id={spentGradientId}
										x1='0'
										y1='0'
										x2='0'
										y2='1'
									>
										<stop
											offset='5%'
											stopColor='var(--color-value)'
											stopOpacity={0.8}
										/>
										<stop
											offset='95%'
											stopColor='var(--color-value)'
											stopOpacity={0.1}
										/>
									</linearGradient>
								</defs>
								<Area
									dataKey='totalSpent'
									type='natural'
									fill={`url(#${spentGradientId})`}
									fillOpacity={0.4}
									stroke='var(--color-value)'
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />}
								/>
							</AreaChart>
						</ChartContainer>
					</CardContent>
				</Card>

				{/* Remaining Card */}
				<Card className='relative min-h-[200px] overflow-hidden border-t-4 border-t-chart-1 transition-all hover:shadow-lg'>
					<CardContent className='relative h-full p-4'>
						<span className='flex justify-center text-2xl font-medium text-muted-foreground'>
							Remaining
						</span>
						<p className='flex justify-center text-2xl font-bold text-foreground sm:text-3xl'>
							${remaining.toLocaleString()}
						</p>
						<ChartContainer
							config={remainingChartConfig}
							className='absolute bottom-0 left-0 right-0 top-[50%] h-[50%] w-full overflow-hidden [&>div]:!h-full [&>div]:!w-full'
						>
							<AreaChart
								data={historicalData}
								margin={{left: 0, right: 0, top: 0, bottom: 0}}
							>
								<defs>
									<linearGradient
										id={remainingGradientId}
										x1='0'
										y1='0'
										x2='0'
										y2='1'
									>
										<stop
											offset='5%'
											stopColor='var(--color-value)'
											stopOpacity={0.8}
										/>
										<stop
											offset='95%'
											stopColor='var(--color-value)'
											stopOpacity={0.1}
										/>
									</linearGradient>
								</defs>
								<Area
									dataKey='remaining'
									type='natural'
									fill={`url(#${remainingGradientId})`}
									fillOpacity={0.4}
									stroke='var(--color-value)'
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />}
								/>
							</AreaChart>
						</ChartContainer>
					</CardContent>
				</Card>

				{/* Savings Rate Card */}
				<Card className='relative min-h-[200px] overflow-hidden border-t-4 border-t-chart-4 transition-all hover:shadow-lg'>
					<CardContent className='relative h-full p-4'>
						<span className='flex justify-center text-2xl font-medium text-muted-foreground'>
							Savings Rate
						</span>
						<p className='flex justify-center text-2xl font-bold text-foreground sm:text-3xl'>
							{savingsRate}%
						</p>
						<ChartContainer
							config={savingsChartConfig}
							className='absolute bottom-0 left-0 right-0 top-[50%] h-[50%] w-full overflow-hidden [&>div]:!h-full [&>div]:!w-full'
						>
							<AreaChart
								data={historicalData}
								margin={{left: 0, right: 0, top: 0, bottom: 0}}
							>
								<defs>
									<linearGradient
										id={savingsGradientId}
										x1='0'
										y1='0'
										x2='0'
										y2='1'
									>
										<stop
											offset='5%'
											stopColor='var(--color-value)'
											stopOpacity={0.8}
										/>
										<stop
											offset='95%'
											stopColor='var(--color-value)'
											stopOpacity={0.1}
										/>
									</linearGradient>
								</defs>
								<Area
									dataKey='savingsRate'
									type='natural'
									fill={`url(#${savingsGradientId})`}
									fillOpacity={0.4}
									stroke='var(--color-value)'
								/>
								<ChartTooltip
									cursor={false}
									content={<ChartTooltipContent hideLabel />}
								/>
							</AreaChart>
						</ChartContainer>
					</CardContent>
				</Card>
			</div>

			{/* Edit Income Popup */}
			<BudgetPopup
				isOpen={showEditIncome}
				onClose={() => {
					setShowEditIncome(false)
				}}
				title={
					<>
						<span>Monthly Money</span>
						<span className='hidden text-lg font-normal text-muted-foreground md:ml-2 md:inline'>
							- Automated Items
						</span>
					</>
				}
			>
				<div>
					{/* Mobile-only chart preview at top of popup */}
					{pieData.length > 0 && (
						<div className='md:hidden'>
							<div className='flex justify-center'>
								<ChartContainer
									config={pieChartConfig}
									className='h-[140px] w-[140px] [&>div]:!h-full [&>div]:!w-full'
								>
									<PieChart>
										<Pie
											data={pieData}
											cx='50%'
											cy='50%'
											innerRadius={40}
											outerRadius={70}
											paddingAngle={1}
											dataKey='value'
										>
											{pieData.map((entry, index) => (
												<Cell key={`cell-popup-${index}`} fill={entry.color} />
											))}
										</Pie>
										<ChartTooltip
											cursor={false}
											content={<ChartTooltipContent hideLabel />}
										/>
									</PieChart>
								</ChartContainer>
							</div>
						</div>
					)}

					{/* Mobile: Automated Items */}
					<div>
						<div className='mb-2 mt-2 flex items-center justify-between gap-2 md:hidden'>
							<label className='text-sm font-medium text-foreground'>
								Automated Items
							</label>
							{/* Mobile: Tabs next to label */}
							<div className='flex gap-2 border-b border-border'>
								<button
									onClick={() => setActiveTab('income')}
									className={`px-3 py-1 text-xs font-medium transition-colors ${
										activeTab === 'income'
											? 'border-b-2 border-primary text-primary'
											: 'text-muted-foreground hover:text-foreground'
									}`}
								>
									<div className='flex items-center gap-1.5'>
										<span className='flex h-4 w-4 items-center justify-center rounded bg-green-500/20 text-green-600 dark:text-green-400'>
											<Plus className='h-2.5 w-2.5' />
										</span>
										<span>Income</span>
									</div>
								</button>
								<button
									onClick={() => setActiveTab('expense')}
									className={`px-3 py-1 text-xs font-medium transition-colors ${
										activeTab === 'expense'
											? 'border-b-2 border-primary text-primary'
											: 'text-muted-foreground hover:text-foreground'
									}`}
								>
									<div className='flex items-center gap-1.5'>
										<span className='flex h-4 w-4 items-center justify-center rounded bg-red-500/20 text-red-600 dark:text-red-400'>
											<Minus className='h-2.5 w-2.5' />
										</span>
										<span>Expenses</span>
									</div>
								</button>
							</div>
						</div>
						<div
							ref={automatedListScrollRef}
							className='max-h-[260px] overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] md:max-h-[400px] [&::-webkit-scrollbar]:hidden'
						>
							{/* Scroll container for list */}
							<AutomatedItemsList
								ref={automatedListRef}
								items={automatedItems}
								month={month}
								year={year}
								onRefetch={onRefetch}
								activeTab={activeTab}
								onActiveTabChange={setActiveTab}
								onNewItemValidityChange={setCanAddAutomatedItem}
								onEditingStateChange={({active, valid}) => {
									setHasActiveEdit(active)
									setHasValidEdit(valid)
								}}
							/>
						</div>
					</div>

					<div className='mt-6 flex gap-3'>
						<Button
							onClick={async () => {
								// Track if we actually changed anything in this click
								let didChange = false

								// Add new automated item
								if (canAddAutomatedItem) {
									setPendingScrollToEnd(true)
									automatedListRef.current?.addNewItem()
									return
								}

								// Save active edit if valid
								if (hasActiveEdit && hasValidEdit) {
									await automatedListRef.current?.saveEdits?.()
									didChange = true
								}

								// If nothing changed, this acts as Close
								if (!didChange) {
									setShowEditIncome(false)
								}
							}}
							disabled={false}
							className='flex-1'
						>
							{canAddAutomatedItem
								? 'Add'
								: hasActiveEdit && hasValidEdit
								? 'Save'
								: 'Close'}
						</Button>
						<Button
							onClick={() => {
								setShowEditIncome(false)
							}}
							variant='outline'
							className='flex-1'
						>
							Cancel
						</Button>
					</div>
				</div>
			</BudgetPopup>
		</>
	)
}

// Prevent Next.js from treating this as a page
export function getServerSideProps() {
	return {
		notFound: true,
	}
}
