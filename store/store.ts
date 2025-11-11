import create from 'zustand'
import {devtools, persist} from 'zustand/middleware'

export interface Store {
	dark_mode: boolean
}

export interface Actions {
	toggle_dark_mode: (value: boolean) => void
}

type StoreAndActions = Store & Actions

export const useStore = create<StoreAndActions>(
	devtools(
		persist(
			(set) => ({
				dark_mode: false,
				toggle_dark_mode: (value: boolean) =>
					set((state) => ({dark_mode: value})),
			}),
			{
				name: 'the-shed-storage',
				partialize: (state) => ({dark_mode: state.dark_mode}),
			}
		),
		{name: 'TheShedStore'}
	)
)
