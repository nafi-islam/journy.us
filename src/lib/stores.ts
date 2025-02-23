import { writable } from 'svelte/store';

export const startState = writable<string>('');
export const targetState = writable<string>('');
