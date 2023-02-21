import create from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Store {
  count: number;
  dark_mode: boolean;
}

export interface Actions {
  increment: (value: number) => void;
  toggle_dark_mode: (value: boolean) => void;
}

type StoreAndActions = Store & Actions;

export const useStore = create < StoreAndActions > (
  devtools((set) => ({
    count: 0,
    dark_mode: false,
    increment: (value: number) => set((state) => ({ count: state.count + value })),
    toggle_dark_mode: (value: boolean) => set((state) => ({ dark_mode: value })),
  })));
