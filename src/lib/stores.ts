import { writable } from 'svelte/store';

export const startState = writable<string>('');
export const targetState = writable<string>('');
export const guessedStates = writable<string[]>([]);
export const guessCount = writable<number>(0);
export const guessesRemaining = writable<number>(0);
