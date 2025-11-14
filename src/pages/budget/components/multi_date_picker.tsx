import * as React from 'react'
import {format} from 'date-fns'
import {CalendarIcon} from 'lucide-react'
import {Calendar} from '@store/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@store/components/ui/popover'
import {Button} from '@store/components/ui/button'
import {cn} from '@store/lib/utils'

interface MultiDatePickerProps {
	value: string[] // Array of ISO date strings (YYYY-MM-DD)
	onChange: (dates: string[]) => void
	placeholder?: string
	disabled?: boolean
	className?: string
	month?: number // Current month being viewed
	year?: number // Current year being viewed
}

export function MultiDatePicker({
	value,
	onChange,
	placeholder = 'Select dates',
	disabled = false,
	className,
	month,
	year,
}: MultiDatePickerProps) {
	const [open, setOpen] = React.useState(false)

	// Helper function to format date as YYYY-MM-DD
	// Extract date components using UTC methods to avoid timezone shifts
	// The calendar gives us the date, we just need to extract it
	const formatDateLocal = (date: Date): string => {
		// Use UTC methods to get the exact date components without timezone conversion
		const year = date.getUTCFullYear()
		const month = date.getUTCMonth() + 1
		const day = date.getUTCDate()
		return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(
			2,
			'0'
		)}`
	}

	// Helper function to parse YYYY-MM-DD string as local date (not UTC)
	const parseDateLocal = (dateStr: string): Date => {
		const [year, month, day] = dateStr.split('-').map(Number)
		// Create date in local timezone
		return new Date(year, month - 1, day)
	}

	// Convert string dates to Date objects for the calendar (parsing as local dates)
	const initialSelectedDates = React.useMemo(() => {
		return value.map(parseDateLocal).filter((d) => !isNaN(d.getTime()))
	}, [value])

	// Local state for dates being selected (not saved until button is clicked)
	const [tempSelectedDates, setTempSelectedDates] =
		React.useState<Date[]>(initialSelectedDates)

	// Update temp dates when popover opens
	React.useEffect(() => {
		if (open) {
			setTempSelectedDates(initialSelectedDates)
		}
	}, [open, initialSelectedDates])

	// Handle date selection - just update local state, don't call onChange
	const handleDateSelect = (dates: Date[] | undefined) => {
		if (!dates) {
			setTempSelectedDates([])
			return
		}
		// Store dates as-is from the calendar - react-day-picker gives us the correct dates
		setTempSelectedDates(dates)
		// Don't call onChange or close popover - user will click button to save
	}

	// Handle popover open/close - save dates when closing if they've been selected
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen && open && tempSelectedDates.length > 0) {
			// Closing with dates selected - save them
			const dateStrings = tempSelectedDates.map(formatDateLocal).sort()
			onChange(dateStrings)
		}
		setOpen(newOpen)
	}

	// Format display text for button (when closed)
	const displayText = React.useMemo(() => {
		if (value.length === 0) return placeholder
		if (value.length === 1) {
			return format(parseDateLocal(value[0]!), 'PPP')
		}
		return `${value.length} dates selected`
	}, [value, placeholder])

	// Button text - changes based on whether popover is open and if dates are selected
	const buttonText = React.useMemo(() => {
		if (!open) {
			// When closed, show current selections or placeholder
			return displayText
		}
		// When open, show action text based on temp selections
		const count = tempSelectedDates.length
		if (count === 0) return 'Select Dates'
		if (count === 1) return 'Set Date'
		return 'Set Dates'
	}, [open, tempSelectedDates.length, displayText])

	// Get month/year for calendar default month
	const defaultMonth = React.useMemo(() => {
		if (month && year) {
			return new Date(year, month - 1, 1)
		}
		return new Date()
	}, [month, year])

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					className={cn(
						'w-full justify-start text-left font-normal',
						value.length === 0 && !open && 'text-muted-foreground',
						className
					)}
					disabled={disabled}
				>
					<CalendarIcon className='mr-2 h-4 w-4' />
					<span className='truncate'>{buttonText}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0' align='start'>
				<Calendar
					mode='multiple'
					selected={tempSelectedDates}
					onSelect={handleDateSelect}
					defaultMonth={defaultMonth}
					month={defaultMonth}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	)
}

export default MultiDatePicker
