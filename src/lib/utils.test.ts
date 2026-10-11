// tests for the svelte glue in utils.ts (stores <-> engine)
// the game rules themselves are tested in src/lib/engine

import { afterEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { gameStatus, resetGame } from './utils';
import { findShortestPath } from './engine/search';
import { statesGraph } from './engine/statesGraph';
import { legacyStatesGraph } from './engine/legacy';
import {
	guessCount,
	guessedStates,
	initialGuessesRemaining,
	modalShownPractice,
	puzzleGraph,
	startState,
	targetState
} from './stores';

afterEach(() => {
	startState.set('');
	targetState.set('');
	guessedStates.set([]);
	puzzleGraph.set(statesGraph);
});

describe('gameStatus (derived store)', () => {
	it('evaluates the puzzle in the stores', () => {
		startState.set('Utah');
		targetState.set('Tennessee');
		guessedStates.set(['Wyoming', 'Nebraska', 'Missouri']);
		expect(get(gameStatus).status).toBe('win');
	});

	it('keeps the guess counters in sync like v1', () => {
		startState.set('Utah');
		targetState.set('Tennessee');
		guessedStates.set(['Wyoming']);
		get(gameStatus);
		expect(get(initialGuessesRemaining)).toBe(6);
		expect(get(guessCount)).toBe(1);
	});

	it('uses the puzzle graph (legacy daily puzzles keep the four corners)', () => {
		startState.set('Arizona');
		targetState.set('Kansas');
		guessedStates.set(['Colorado']);
		expect(get(gameStatus).status).toBe('playing'); // not a border on the current graph

		puzzleGraph.set(legacyStatesGraph);
		expect(get(gameStatus).status).toBe('win');
	});
});

describe('resetGame', () => {
	it('clears guesses and sets a new practice puzzle on the current graph', () => {
		puzzleGraph.set(legacyStatesGraph);
		guessedStates.set(['Texas']);
		guessCount.set(1);
		modalShownPractice.set(true);

		resetGame();

		const optimal = findShortestPath(get(startState), get(targetState))!.length - 2;
		expect(get(puzzleGraph)).toBe(statesGraph);
		expect(get(guessedStates)).toEqual([]);
		expect(get(guessCount)).toBe(0);
		expect(get(initialGuessesRemaining)).toBe(optimal + 3);
		expect(get(modalShownPractice)).toBe(false);
	});
});
