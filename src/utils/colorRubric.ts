export interface ColorRubricEntry {
	primary: string
	primaryHex: string
	secondary: string
	text: string
	background: string
	shouldAnimatePageTransition?: boolean
}

export const colorRubric: Record<string, ColorRubricEntry> = {
	home: {
		primary: 'bg-secondary',
		primaryHex: '#00b0ff',
		secondary: 'bg-blue-700',
		text: 'text-white',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		shouldAnimatePageTransition: true,
	},
	tasks: {
		primary: 'bg-green-600',
		primaryHex: '#16a34a',
		secondary: 'bg-green-700',
		text: 'text-white',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		shouldAnimatePageTransition: true,
	},
	socials: {
		primary: 'bg-purple-600',
		primaryHex: '#9333ea',
		secondary: 'bg-purple-700',
		text: 'text-white',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		shouldAnimatePageTransition: true,
	},
	calendar: {
		primary: 'bg-red-600',
		primaryHex: '#dc2626',
		secondary: 'bg-red-700',
		text: 'text-white',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		shouldAnimatePageTransition: true,
	},
	arcade: {
		primary: 'bg-yellow-600',
		primaryHex: '#ca8a04',
		secondary: 'bg-yellow-700',
		text: 'text-white',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		shouldAnimatePageTransition: true,
	},
	about: {
		primary: 'bg-indigo-600',
		primaryHex: '#4f46e5',
		secondary: 'bg-indigo-700',
		text: 'text-white',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		shouldAnimatePageTransition: true,
	},
	// Social-specific colors - these should NOT animate page transitions
	'personal-instagram': {
		primary: 'bg-pink-500',
		primaryHex: '#ec4899',
		secondary: 'bg-pink-600',
		text: 'text-white',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		shouldAnimatePageTransition: false,
	},
	'tattoo-instagram': {
		primary: 'bg-pink-600',
		primaryHex: '#db2777',
		secondary: 'bg-pink-700',
		text: 'text-white',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		shouldAnimatePageTransition: false,
	},
	'personal-youtube': {
		primary: 'bg-red-500',
		primaryHex: '#ef4444',
		secondary: 'bg-red-600',
		text: 'text-white',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		shouldAnimatePageTransition: false,
	},
	'letsclone-youtube': {
		primary: 'bg-red-600',
		primaryHex: '#dc2626',
		secondary: 'bg-red-700',
		text: 'text-white',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		shouldAnimatePageTransition: false,
	},
	back: {
		primary: 'bg-secondary', // Use the default secondary color for the back button
		primaryHex: '#00b0ff',
		secondary: 'bg-secondary',
		text: 'text-white',
		background: 'bg-gradient-to-t from-primary-light to-primary-dark',
		shouldAnimatePageTransition: true,
	},
}

export const getRubricColor = (key: string): ColorRubricEntry => {
	return colorRubric[key] || colorRubric.home
}
