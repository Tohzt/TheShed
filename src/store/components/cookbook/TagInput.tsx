import * as React from 'react'

interface TagInputProps {
	label: string
	placeholder: string
	value: string[]
	onChange: (tags: string[]) => void
}

export const TagInput: React.FC<TagInputProps> = ({
	label,
	placeholder,
	value,
	onChange,
}) => {
	const [input, setInput] = React.useState('')

	const handleAddTag = () => {
		if (input.trim() && !value.includes(input.trim())) {
			onChange([...value, input.trim()])
			setInput('')
		}
	}

	const handleRemoveTag = (tag: string) => {
		onChange(value.filter((t) => t !== tag))
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleAddTag()
		}
	}

	return (
		<div className='flex flex-col gap-2'>
			<label className='text-sm font-medium text-foreground'>{label}</label>
			<div className='flex gap-2'>
				<input
					type='text'
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder={placeholder}
					className='flex-1 rounded-md border border-border bg-background px-3 py-2 text-foreground'
				/>
				<button
					type='button'
					onClick={handleAddTag}
					className='rounded-md bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700'
				>
					Add
				</button>
			</div>
			{value.length > 0 && (
				<div className='flex flex-wrap gap-2'>
					{value.map((tag) => (
						<div
							key={tag}
							className='flex items-center gap-2 rounded-full bg-orange-600 px-3 py-1 text-sm font-medium text-white'
						>
							{tag}
							<button
								type='button'
								onClick={() => handleRemoveTag(tag)}
								className='hover:text-orange-100'
							>
								×
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
