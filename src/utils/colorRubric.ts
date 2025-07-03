export interface ColorRubricEntry {
	primary: string
	secondary: string
	text: string
}

export const colorRubric: Record<string, ColorRubricEntry> = {
	home: {
		primary: 'bg-secondary',
		secondary: 'bg-blue-700',
		text: 'text-white',
	},
	tasks: {
		primary: 'bg-green-600',
		secondary: 'bg-green-700',
		text: 'text-white',
	},
	socials: {
		primary: 'bg-purple-600',
		secondary: 'bg-purple-700',
		text: 'text-white',
	},
	calendar: {
		primary: 'bg-red-600',
		secondary: 'bg-red-700',
		text: 'text-white',
	},
	arcade: {
		primary: 'bg-yellow-600',
		secondary: 'bg-yellow-700',
		text: 'text-white',
	},
	about: {
		primary: 'bg-indigo-600',
		secondary: 'bg-indigo-700',
		text: 'text-white',
	},
	// Social-specific colors
	'personal-instagram': {
		primary: 'bg-pink-500',
		secondary: 'bg-pink-600',
		text: 'text-white',
	},
	'tattoo-instagram': {
		primary: 'bg-pink-600',
		secondary: 'bg-pink-700',
		text: 'text-white',
	},
	'personal-youtube': {
		primary: 'bg-red-500',
		secondary: 'bg-red-600',
		text: 'text-white',
	},
	'letsclone-youtube': {
		primary: 'bg-red-600',
		secondary: 'bg-red-700',
		text: 'text-white',
	},
	back: {
		primary: 'bg-secondary', // Use the default secondary color for the back button
		secondary: 'bg-secondary',
		text: 'text-white',
	},
}

export const getRubricColor = (key: string): ColorRubricEntry => {
	return colorRubric[key] || colorRubric.home
}
