import React from 'react'
import { DayPicker } from 'react-day-picker'
import * as Popover from '@radix-ui/react-popover'
import { Calendar } from 'lucide-react'
import 'react-day-picker/dist/style.css'

interface DatePickerProps {
	value?: string // YYYY-MM-DD format
	onChange: (date: string | undefined) => void
	placeholder?: string
	disabled?: boolean
}

export const DatePicker = ({ value, onChange, placeholder = 'Pick a date', disabled = false }: DatePickerProps) => {
	const [isOpen, setIsOpen] = React.useState(false)
	const selectedDate = value ? new Date(value + 'T00:00:00') : undefined

	const handleDayClick = (date: Date | undefined) => {
		if (date) {
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			onChange(`${year}-${month}-${day}`)
		} else {
			onChange(undefined)
		}
		setIsOpen(false)
	}

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation()
		onChange(undefined)
	}

	const displayText = value ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	}) : placeholder

	return (
		<Popover.Root open={isOpen} onOpenChange={setIsOpen}>
			<Popover.Trigger asChild>
				<button
					type="button"
					disabled={disabled}
					className="flex w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
				>
					<Calendar className="h-4 w-4" />
					<span className="flex-1 text-left text-sm">{displayText}</span>
					{value && (
						<button
							type="button"
							onClick={handleClear}
							className="text-muted-foreground hover:text-foreground"
						>
							✕
						</button>
					)}
				</button>
			</Popover.Trigger>
			<Popover.Content className="z-50 rounded-md border border-border bg-card p-3 shadow-md">
				<DayPicker
					mode="single"
					selected={selectedDate}
					onSelect={handleDayClick}
					disabled={disabled}
				/>
			</Popover.Content>
		</Popover.Root>
	)
}
