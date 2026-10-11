import { writable } from 'svelte/store';
import { statesGraph, type StatesGraph } from './engine/statesGraph';

export const startState = writable<string>('');
export const targetState = writable<string>('');
export const guessedStates = writable<string[]>([]);

// the graph the current puzzle is played on (legacy daily puzzles use the v1 graph)
export const puzzleGraph = writable<StatesGraph>(statesGraph);

export const guessCount = writable<number>(0);
export const initialGuessesRemaining = writable<number>(0);
export const guessesRemaining = writable<number>(0);

export const pathLength = writable<number>(0);

export const isLoading = writable(true);
export const mapLoaded = writable(false);

export const statesLoaded = writable(false);
export const showPlayAgain = writable(false); // default to daily challenge

export const showPractice = writable(false);
export const practiceMode = writable(false);

export const dailyStartState = writable<string>('');
export const dailyTargetState = writable<string>('');
export const dailyPathLength = writable<number>(0);
export const dailyShortestPath = writable<string[]>([]);

export const dailyGuessedStates = writable<string[]>([]);
export const dailyGuessCount = writable<number>(0);

export const modalShownDaily = writable(false);
export const modalShownPractice = writable(false);
