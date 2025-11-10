import {useId, useState} from 'react'
import {Area, AreaChart} from 'recharts'
import {api} from '../../../utils/api'
import BudgetPopup from './budget_popup'
import {Card, CardContent} from '@store/components/ui/card'
import {Button} from '@store/components/ui/button'
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@store/components/ui/chart'

interface BudgetSummaryProps {
	income: number
	totalSpent: number
	remaining: number
	savingsRate: string
	onRefetch: () => void
}

export default function BudgetSummary({
	income,
	totalSpent,
	remaining,
	savingsRate,
	onRefetch,
}: BudgetSummaryProps) {
	const [showEditIncome, setShowEditIncome] = useState(false)
	const [newIncome, setNewIncome] = useState('')

	// Get unique IDs for gradients
	const incomeGradientId = useId()
	const spentGradientId = useId()
	const remainingGradientId = useId()
	const savingsGradientId = useId()

	// Get current month/year
	const currentDate = new Date()
	const month = currentDate.getMonth() + 1
	const year = currentDate.getFullYear()

	// Fetch historical data for charts
	const {data: historicalData = []} = api.budget.getHistoricalBudget.useQuery({
		months: 6,
	})

	// Mutation for setting monthly income
	const setIncomeMutation = api.budget.setMonthlyIncome.useMutation({
		onSuccess: () => {
			onRefetch()
			setShowEditIncome(false)
			setNewIncome('')
		},
	})

	// Chart configurations
	const incomeChartConfig = {
		value: {
			label: 'Income',
			color: 'hsl(var(--primary))',
		},
	} satisfies ChartConfig

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

	// Handle setting income
	const handleSetIncome = () => {
		const incomeValue = parseFloat(newIncome)
		if (isNaN(incomeValue) || incomeValue < 0) return

		setIncomeMutation.mutate({
			month,
			year,
			income: incomeValue,
		})
	}

	// Handle clicking on income card
	const handleIncomeClick = () => {
		setNewIncome(income.toString())
		setShowEditIncome(true)
	}

	return (
		<>
			<div className='mb-8 grid w-full max-w-6xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
				{/* Income Card */}
				<Card
					onClick={handleIncomeClick}
					className='relative min-h-[200px] cursor-pointer overflow-hidden border-t-4 border-t-primary transition-all hover:scale-[1.02] hover:shadow-lg'
				>
					<CardContent className='absolute inset-0 top-0 h-full w-full overflow-hidden pt-2'>
						<span className='flex justify-center text-2xl font-medium text-muted-foreground'>
							Monthly Income
						</span>
						<p className='flex justify-center text-2xl font-bold text-foreground sm:text-3xl'>
							${income.toLocaleString()}
						</p>
						<ChartContainer
							config={incomeChartConfig}
							className='absolute bottom-0 left-0 right-0 top-[50%] h-[50%] w-full overflow-hidden [&>div]:!h-full [&>div]:!w-full'
						>
							<AreaChart
								data={historicalData}
								margin={{left: 0, right: 0, top: 0, bottom: 0}}
							>
								<defs>
									<linearGradient
										id={incomeGradientId}
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
									dataKey='income'
									type='natural'
									fill={`url(#${incomeGradientId})`}
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

				{/* Total Spent Card */}
				<Card className='relative min-h-[200px] overflow-hidden border-t-4 border-t-destructive transition-all hover:scale-[1.02] hover:shadow-lg'>
					<CardContent className='absolute inset-0 top-0 h-full w-full overflow-hidden pt-2'>
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
				<Card className='relative min-h-[200px] overflow-hidden border-t-4 border-t-chart-1 transition-all hover:scale-[1.02] hover:shadow-lg'>
					<CardContent className='absolute inset-0 top-0 h-full w-full overflow-hidden pt-2'>
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
				<Card className='relative min-h-[200px] overflow-hidden border-t-4 border-t-chart-4 transition-all hover:scale-[1.02] hover:shadow-lg'>
					<CardContent className='absolute inset-0 top-0 h-full w-full overflow-hidden pt-2'>
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
					setNewIncome('')
				}}
				title='Set Monthly Income'
			>
				<div className='mb-4'>
					<label className='mb-2 block text-sm font-medium text-foreground'>
						Monthly Income
					</label>
					<input
						type='number'
						placeholder='Enter monthly income'
						value={newIncome}
						onChange={(e) => setNewIncome(e.target.value)}
						className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
						min='0'
						step='0.01'
					/>
				</div>
				<div className='flex gap-3'>
					<Button
						onClick={handleSetIncome}
						disabled={!newIncome || parseFloat(newIncome) < 0}
						className='flex-1'
					>
						Save
					</Button>
					<Button
						onClick={() => {
							setShowEditIncome(false)
							setNewIncome('')
						}}
						variant='outline'
						className='flex-1'
					>
						Cancel
					</Button>
				</div>
			</BudgetPopup>
		</>
	)
}
