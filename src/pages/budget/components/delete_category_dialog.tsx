import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@store/components/ui/alert-dialog'

interface ConfirmDeleteDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title?: string
	description?: string
	itemName?: string
	onConfirm: () => void
	isDeleting?: boolean
	confirmLabel?: string
	cancelLabel?: string
}

export default function ConfirmDeleteDialog({
	open,
	onOpenChange,
	title = 'Delete Item',
	description,
	itemName,
	onConfirm,
	isDeleting = false,
	confirmLabel = 'Delete',
	cancelLabel = 'Cancel',
}: ConfirmDeleteDialogProps) {
	const defaultDescription = itemName
		? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
		: 'Are you sure you want to delete this item? This action cannot be undone.'

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>
						{description || defaultDescription}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>
						{cancelLabel}
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isDeleting}
						className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
					>
						{isDeleting ? 'Deleting...' : confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
