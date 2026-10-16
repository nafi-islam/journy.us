// guess input handling: cleaning the input and deciding if a guess is allowed

import { statesGraph, type StatesGraph } from './statesGraph';
import { isGameOver, type GameStatusType } from './rules';

export type GuessRejection = 'empty' | 'invalid' | 'duplicate' | 'start-or-target' | 'game-over';

export type GuessCheck = { ok: true; state: string } | { ok: false; reason: GuessRejection };

export interface GuessContext {
	start: string;
	target: string;
	guessed: string[];
	status: GameStatusType;
	graph?: StatesGraph;
}

// Function to clean the user input
export function formatStateName(state: string): string {
	return state
		.trim()
		.split(/\s+/) // Split by spaces
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
		.join(' '); // Rejoin into a proper state name
}

// Function to check if a guess is allowed
// a finished game never takes more guesses (v1 bug 1: the enter key could add guesses)
export function checkGuess(input: string, context: GuessContext): GuessCheck {
	const { start, target, guessed, status, graph = statesGraph } = context;

	if (isGameOver(status)) return { ok: false, reason: 'game-over' };
	if (input.trim() === '') return { ok: false, reason: 'empty' };

	const state = formatStateName(input);

	if (!(state in graph)) return { ok: false, reason: 'invalid' };
	if (guessed.includes(state)) return { ok: false, reason: 'duplicate' };
	if (state === start || state === target) return { ok: false, reason: 'start-or-target' };

	return { ok: true, state };
}
