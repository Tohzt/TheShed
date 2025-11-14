import {MoreVertical} from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@store/components/ui/dropdown-menu'

interface BudgetDropdownProps {
	items: {
		label: string
		onClick: () => void
	}[]
}

export default function BudgetDropdown({items = []}: BudgetDropdownProps) {
	return (
		<DropdownMenu>
			<DropdownMenuContent align='end'>
				{items.map((item, index) => (
					<DropdownMenuItem
						key={index}
						onClick={(e) => {
							e.stopPropagation()
							item.onClick()
						}}
					>
						{item.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
