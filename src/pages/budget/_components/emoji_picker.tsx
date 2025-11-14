import {useState, useEffect} from 'react'
import {Smile, X} from 'lucide-react'
import {Button} from '../../../store/components/ui/button'

interface EmojiPickerProps {
	value: string
	onChange: (emoji: string) => void
	trigger?: React.ReactNode
}

const EMOJI_CATEGORIES = {
	'Food & Drink': [
		'🍔',
		'🍕',
		'🍟',
		'🌮',
		'🌯',
		'🍜',
		'🍱',
		'🍣',
		'🍙',
		'🍘',
		'🍚',
		'🍛',
		'🍲',
		'🍳',
		'🥘',
		'🥗',
		'🥙',
		'🥪',
		'🥫',
		'🍝',
		'🍠',
		'🍢',
		'🍤',
		'🍥',
		'🥮',
		'🥟',
		'🥠',
		'🥡',
		'🍦',
		'🍧',
		'🍨',
		'🍩',
		'🍪',
		'🎂',
		'🍰',
		'🧁',
		'🥧',
		'🍫',
		'🍬',
		'🍭',
		'🍮',
		'🍯',
		'🍼',
		'🥛',
		'☕',
		'🍵',
		'🍶',
		'🍷',
		'🍸',
		'🍹',
		'🍺',
		'🍻',
		'🥂',
		'🥃',
		'🥤',
	],
	'Travel & Places': [
		'✈️',
		'🚀',
		'🚁',
		'🚂',
		'🚃',
		'🚄',
		'🚅',
		'🚆',
		'🚇',
		'🚈',
		'🚉',
		'🚊',
		'🚋',
		'🚌',
		'🚍',
		'🚎',
		'🚐',
		'🚑',
		'🚒',
		'🚓',
		'🚔',
		'🚕',
		'🚖',
		'🚗',
		'🚘',
		'🚙',
		'🚚',
		'🚛',
		'🚜',
		'🏎️',
		'🏍️',
		'🛵',
		'🛴',
		'🛹',
		'🛺',
		'🚲',
		'🛤️',
		'🛣️',
		'🛢️',
		'⛽',
		'🚨',
		'🚥',
		'🚦',
		'🚧',
		'🛑',
		'⚓',
		'⛵',
		'🛶',
		'🚤',
		'🛳️',
		'⛴️',
		'🛥️',
		'🚢',
		'⚓',
		'🏖️',
		'🏝️',
		'🏜️',
		'🌋',
		'⛰️',
		'🏔️',
		'🗻',
		'🏕️',
		'⛺',
		'🏠',
		'🏡',
		'🏘️',
		'🏚️',
		'🏗️',
		'🏭',
		'🏢',
		'🏬',
		'🏣',
		'🏤',
		'🏥',
		'🏦',
		'🏨',
		'🏩',
		'🏪',
		'🏫',
		'🏬',
		'🏭',
		'🏯',
		'🏰',
		'🗼',
		'🗽',
		'⛪',
		'🕌',
		'🛕',
		'🕍',
		'⛩️',
		'🕋',
		'⛲',
		'⛺',
		'🌁',
		'🌃',
		'🏙️',
		'🌄',
		'🌅',
		'🌆',
		'🌇',
		'🌉',
		'♨️',
		'🎠',
		'🎡',
		'🎢',
		'💈',
		'🎪',
		'🚂',
		'🚃',
		'🚄',
		'🚅',
		'🚆',
		'🚇',
		'🚈',
		'🚉',
		'🚊',
		'🚝',
		'🚞',
		'🚋',
		'🚌',
		'🚍',
		'🚎',
		'🚐',
		'🚑',
		'🚒',
		'🚓',
		'🚔',
		'🚕',
		'🚖',
		'🚗',
		'🚘',
		'🚙',
		'🚚',
		'🚛',
		'🚜',
		'🏎️',
		'🏍️',
		'🛵',
		'🛴',
		'🛹',
		'🛺',
		'🚲',
		'🛤️',
		'🛣️',
		'🛢️',
		'⛽',
		'🚨',
		'🚥',
		'🚦',
		'🚧',
		'🛑',
		'⚓',
		'⛵',
		'🛶',
		'🚤',
		'🛳️',
		'⛴️',
		'🛥️',
		'🚢',
	],
	'Money & Finance': [
		'💰',
		'💴',
		'💵',
		'💶',
		'💷',
		'💸',
		'💳',
		'🧾',
		'💹',
		'💱',
		'💲',
		'💳',
		'🏦',
		'📊',
		'📈',
		'📉',
		'💼',
		'🧮',
		'🔢',
		'💯',
	],
	Activities: [
		'⚽',
		'🏀',
		'🏈',
		'⚾',
		'🥎',
		'🎾',
		'🏐',
		'🏉',
		'🥏',
		'🎱',
		'🏓',
		'🏸',
		'🥅',
		'🏒',
		'🏑',
		'🏏',
		'🥃',
		'⛳',
		'🏹',
		'🎣',
		'🥊',
		'🥋',
		'🎽',
		'🛹',
		'🛷',
		'⛸️',
		'🥌',
		'🎿',
		'⛷️',
		'🏂',
		'🏋️',
		'🤼',
		'🤸',
		'🤺',
		'🤾',
		'🤹',
		'🧘',
		'🏄',
		'🏊',
		'🤽',
		'🚣',
		'🧗',
		'🚵',
		'🚴',
		'🏇',
		'🧩',
		'🎮',
		'🕹️',
		'🎰',
		'🎲',
		'♟️',
		'🎯',
		'🎳',
		'🎮',
		'🎰',
		'🎲',
		'🎯',
		'🎳',
		'🎴',
		'🃏',
		'🀄',
		'🎴',
		'🎭',
		'🖼️',
		'🎨',
		'🧵',
		'🧶',
		'🎪',
		'🎭',
		'🎬',
		'🎤',
		'🎧',
		'🎼',
		'🎹',
		'🥁',
		'🎷',
		'🎺',
		'🎸',
		'🎻',
		'🎲',
		'🎯',
		'🎳',
		'🎮',
		'🎰',
		'🎲',
		'🎯',
		'🎳',
		'🎴',
		'🃏',
		'🀄',
		'🎴',
		'🎭',
		'🖼️',
		'🎨',
		'🧵',
		'🧶',
		'🎪',
		'🎭',
		'🎬',
		'🎤',
		'🎧',
		'🎼',
		'🎹',
		'🥁',
		'🎷',
		'🎺',
		'🎸',
		'🎻',
	],
	Objects: [
		'📱',
		'💻',
		'⌨️',
		'🖥️',
		'🖨️',
		'🖱️',
		'🖲️',
		'🕹️',
		'🗜️',
		'💾',
		'💿',
		'📀',
		'📼',
		'📷',
		'📸',
		'📹',
		'🎥',
		'📽️',
		'🎞️',
		'📞',
		'☎️',
		'📟',
		'📠',
		'📺',
		'📻',
		'🎙️',
		'🎚️',
		'🎛️',
		'⏱️',
		'⏲️',
		'⏰',
		'🕰️',
		'⌛',
		'⏳',
		'📡',
		'🔋',
		'🔌',
		'💡',
		'🔦',
		'🕯️',
		'🧯',
		'🛢️',
		'💸',
		'💵',
		'💴',
		'💶',
		'💷',
		'💰',
		'💳',
		'💎',
		'⚖️',
		'🛠️',
		'🔨',
		'⚒️',
		'🛠️',
		'🔧',
		'🔩',
		'⚙️',
		'🗜️',
		'⚡',
		'🔥',
		'💧',
		'🌊',
	],
	Common: [
		'😀',
		'😃',
		'😄',
		'😁',
		'😆',
		'😅',
		'🤣',
		'😂',
		'🙂',
		'🙃',
		'😉',
		'😊',
		'😇',
		'🥰',
		'😍',
		'🤩',
		'😘',
		'😗',
		'☺️',
		'😚',
		'😙',
		'🥲',
		'😋',
		'😛',
		'😜',
		'🤪',
		'😝',
		'🤑',
		'🤗',
		'🤭',
		'🤫',
		'🤔',
		'🤐',
		'🤨',
		'😐',
		'😑',
		'😶',
		'😏',
		'😒',
		'🙄',
		'😬',
		'🤥',
		'😌',
		'😔',
		'😪',
		'🤤',
		'😴',
		'😷',
		'🤒',
		'🤕',
		'🤢',
		'🤮',
		'🤧',
		'🥵',
		'🥶',
		'😶‍🌫️',
		'😵',
		'🤯',
		'🤠',
		'🥳',
		'😎',
		'🤓',
		'🧐',
		'😕',
		'😟',
		'🙁',
		'☹️',
		'😮',
		'😯',
		'😲',
		'😳',
		'🥺',
		'😦',
		'😧',
		'😨',
		'😰',
		'😥',
		'😢',
		'😭',
		'😱',
		'😖',
		'😣',
		'😞',
		'😓',
		'😩',
		'😫',
		'🥱',
		'😤',
		'😡',
		'😠',
		'🤬',
		'😈',
		'👿',
		'💀',
		'☠️',
		'💩',
		'🤡',
		'👹',
		'👺',
		'👻',
		'👽',
		'👾',
		'🤖',
		'😺',
		'😸',
		'😹',
		'😻',
		'😼',
		'😽',
		'🙀',
		'😿',
		'😾',
	],
}

export default function EmojiPicker({
	value,
	onChange,
	trigger,
}: EmojiPickerProps) {
	const [open, setOpen] = useState(false)
	const [selectedCategory, setSelectedCategory] = useState<string>(
		Object.keys(EMOJI_CATEGORIES)[0]
	)

	const categories = Object.keys(EMOJI_CATEGORIES)
	const emojis =
		EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES] || []

	// Close on escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && open) {
				setOpen(false)
			}
		}

		if (open) {
			document.addEventListener('keydown', handleEscape)
		}

		return () => {
			document.removeEventListener('keydown', handleEscape)
		}
	}, [open])

	return (
		<>
			{trigger ? (
				<div onClick={() => setOpen(true)}>{trigger}</div>
			) : (
				<Button
					type='button'
					variant='outline'
					size='icon'
					className='h-9 w-9'
					onClick={() => setOpen(true)}
				>
					<Smile className='h-4 w-4' />
				</Button>
			)}

			{open && (
				<div
					className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm dark:bg-black/70'
					onClick={() => setOpen(false)}
				>
					<div
						className='relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl dark:border-border/50 dark:bg-[#1a1a1a]'
						onClick={(e) => e.stopPropagation()}
					>
						{/* Close Button */}
						<button
							onClick={() => setOpen(false)}
							className='absolute right-4 top-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
							aria-label='Close'
						>
							<X className='h-4 w-4' />
						</button>

						<div className='flex flex-col p-4'>
							{/* Title */}
							<h3 className='mb-4 pr-8 text-lg font-semibold text-foreground'>
								Choose an Emoji
							</h3>

							{/* Category Tabs */}
							<div className='mb-3 flex overflow-x-auto border-b border-border'>
								{categories.map((category) => (
									<button
										key={category}
										onClick={() => setSelectedCategory(category)}
										className={`whitespace-nowrap px-3 py-2 text-xs font-medium transition-colors ${
											selectedCategory === category
												? 'border-b-2 border-primary bg-muted/50 text-primary'
												: 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
										}`}
									>
										{category}
									</button>
								))}
							</div>

							{/* Emoji Grid */}
							<div className='h-[300px] overflow-y-auto'>
								<div className='grid grid-cols-8 gap-1'>
									{emojis.map((emoji, index) => (
										<button
											key={`${emoji}-${index}`}
											onClick={() => {
												onChange(emoji)
												setOpen(false)
											}}
											className='flex h-9 w-9 items-center justify-center rounded-md text-xl transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
											aria-label={`Select ${emoji} emoji`}
										>
											{emoji}
										</button>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

// Prevent Next.js from treating this as a page
export async function getServerSideProps() {
	return {
		notFound: true,
	}
}
