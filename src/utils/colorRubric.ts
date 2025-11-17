export interface ColorRubricEntry {
	primary: string
	primaryHex: string
	secondary: string
	background: string
	borderColor: string // Border color class
	textColor: string // Text color class
	mutedBg: string // Muted/darker background color class
	shouldAnimatePageTransition?: boolean
}

export const colorRubric: Record<string, ColorRubricEntry> = {
	home: {
		primary: 'bg-secondary',
		primaryHex: '#00b0ff',
		secondary: 'bg-blue-700',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		borderColor: 'border-blue-500',
		textColor: 'text-blue-500',
		mutedBg: 'bg-blue-950/30',
		shouldAnimatePageTransition: true,
	},
	tasks: {
		primary: 'bg-green-600',
		primaryHex: '#16a34a',
		secondary: 'bg-green-700',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		borderColor: 'border-green-500',
		textColor: 'text-green-500',
		mutedBg: 'bg-green-950/30',
		shouldAnimatePageTransition: true,
	},
	socials: {
		primary: 'bg-purple-600',
		primaryHex: '#9333ea',
		secondary: 'bg-purple-700',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		borderColor: 'border-purple-500',
		textColor: 'text-purple-500',
		mutedBg: 'bg-purple-950/30',
		shouldAnimatePageTransition: true,
	},
	calendar: {
		primary: 'bg-red-600',
		primaryHex: '#dc2626',
		secondary: 'bg-red-700',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		borderColor: 'border-red-500',
		textColor: 'text-red-500',
		mutedBg: 'bg-red-950/30',
		shouldAnimatePageTransition: true,
	},
	arcade: {
		primary: 'bg-yellow-600',
		primaryHex: '#ca8a04',
		secondary: 'bg-yellow-700',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		borderColor: 'border-yellow-500',
		textColor: 'text-yellow-500',
		mutedBg: 'bg-yellow-950/30',
		shouldAnimatePageTransition: true,
	},
	about: {
		primary: 'bg-indigo-600',
		primaryHex: '#4f46e5',
		secondary: 'bg-indigo-700',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		borderColor: 'border-indigo-500',
		textColor: 'text-indigo-500',
		mutedBg: 'bg-indigo-950/30',
		shouldAnimatePageTransition: true,
	},
	// Social-specific colors - these should NOT animate page transitions
	'personal-instagram': {
		primary: 'bg-pink-500',
		primaryHex: '#ec4899',
		secondary: 'bg-pink-600',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		borderColor: 'border-pink-500',
		textColor: 'text-pink-500',
		mutedBg: 'bg-pink-950/30',
		shouldAnimatePageTransition: false,
	},
	'tattoo-instagram': {
		primary: 'bg-pink-600',
		primaryHex: '#db2777',
		secondary: 'bg-pink-700',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		borderColor: 'border-pink-600',
		textColor: 'text-pink-600',
		mutedBg: 'bg-pink-950/30',
		shouldAnimatePageTransition: false,
	},
	'personal-youtube': {
		primary: 'bg-red-500',
		primaryHex: '#ef4444',
		secondary: 'bg-red-600',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		borderColor: 'border-red-500',
		textColor: 'text-red-500',
		mutedBg: 'bg-red-950/30',
		shouldAnimatePageTransition: false,
	},
	'letsclone-youtube': {
		primary: 'bg-red-600',
		primaryHex: '#dc2626',
		secondary: 'bg-red-700',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		borderColor: 'border-red-600',
		textColor: 'text-red-600',
		mutedBg: 'bg-red-950/30',
		shouldAnimatePageTransition: false,
	},
	back: {
		primary: 'bg-secondary', // Use the default secondary color for the back button
		primaryHex: '#00b0ff',
		secondary: 'bg-secondary',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		borderColor: 'border-blue-500',
		textColor: 'text-blue-500',
		mutedBg: 'bg-blue-950/30',
		shouldAnimatePageTransition: true,
	},
	budget: {
		primary: 'bg-emerald-600',
		primaryHex: '#059669',
		secondary: 'bg-emerald-700',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		borderColor: 'border-emerald-500',
		textColor: 'text-emerald-500',
		mutedBg: 'bg-emerald-950/30',
		shouldAnimatePageTransition: true,
	},
}

export const getRubricColor = (key: string): ColorRubricEntry => {
	return colorRubric[key] || colorRubric.home
}
