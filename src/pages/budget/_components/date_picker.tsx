import * as React from 'react'
import {format} from 'date-fns'
import {CalendarIcon} from 'lucide-react'
import {Calendar} from '../../../store/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '../../../store/components/ui/popover'
import {Button} from '../../../store/components/ui/button'
import {cn} from '../../../store/lib/utils'

interface DatePickerProps {
	value?: string // ISO date string (YYYY-MM-DD)
	onChange: (date: string | undefined) => void
	placeholder?: string
	disabled?: boolean
	className?: string
}

// Helper to parse YYYY-MM-DD as local date (not UTC)
function parseLocalDate(dateStr: string): Date {
	const [year, month, day] = dateStr.split('-').map(Number)
	return new Date(year, month - 1, day)
}

// Helper to format Date as YYYY-MM-DD (local date, not UTC)
function formatLocalDate(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export function DatePicker({
	value,
	onChange,
	placeholder = 'Pick a date',
	disabled = false,
	className,
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false)
	const date = value ? parseLocalDate(value) : undefined

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					className={cn(
						'w-full justify-start text-left font-normal',
						!date && 'text-muted-foreground',
						className
					)}
					disabled={disabled}
				>
					<CalendarIcon className='mr-2 h-4 w-4' />
					{date ? format(date, 'PPP') : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0' align='start'>
				<Calendar
					mode='single'
					selected={date}
					onSelect={(selectedDate) => {
						if (selectedDate) {
							onChange(formatLocalDate(selectedDate))
						} else {
							onChange(undefined)
						}
						setOpen(false)
					}}
					autoFocus
				/>
			</PopoverContent>
		</Popover>
	)
}

export default DatePicker

// Prevent Next.js from treating this as a page
export function getServerSideProps() {
	return {
		notFound: true,
	}
}
