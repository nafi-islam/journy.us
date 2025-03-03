import { writable } from 'svelte/store';

export const startState = writable<string>('');
export const targetState = writable<string>('');
export const guessedStates = writable<string[]>([]);
export const guessCount = writable<number>(0);
export const initialGuessesRemaining = writable<number>(0);
export const guessesRemaining = writable<number>(0);
export const pathLength = writable<number>(0);
export const isLoading = writable(true);
export const mapLoaded = writable(false);
export const statesLoaded = writable(false);
export const showPlayAgain = writable(false);
