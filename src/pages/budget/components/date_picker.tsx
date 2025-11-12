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

interface DatePickerProps {
	value?: string // ISO date string (YYYY-MM-DD)
	onChange: (date: string | undefined) => void
	placeholder?: string
	disabled?: boolean
	className?: string
}

export function DatePicker({
	value,
	onChange,
	placeholder = 'Pick a date',
	disabled = false,
	className,
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false)
	const date = value ? new Date(value) : undefined

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
							onChange(selectedDate.toISOString().split('T')[0])
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
