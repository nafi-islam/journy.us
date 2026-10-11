// tests for the v1 game logic in utils.ts (bfs, scoring, win / lose rules)
// these pin v1 behavior before the v2 refactor. known bugs use it.fails so they document
// the current behavior and flip to normal tests once fixed

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { statesGraph } from './statesGraph';
import {
	findAllShortestPaths,
	findShortestPath,
	formatStateName,
	gameStatus,
	getGuessScore,
	getRandomStatePair,
	isInAnyShortestPath,
	resetGame
} from './utils';
import {
	guessCount,
	guessedStates,
	initialGuessesRemaining,
	modalShownPractice,
	startState,
	targetState
} from './stores';

// Function to check that every step of a path crosses a real border
function isConnectedPath(path: string[]): boolean {
	return path.every((state, i) => i === 0 || statesGraph[path[i - 1]].includes(state));
}

// Function to set up a game in the stores and read the derived status
function statusFor(start: string, target: string, guesses: string[]): string {
	startState.set(start);
	targetState.set(target);
	guessedStates.set(guesses);
	return get(gameStatus).status;
}

// utah -> tennessee was the daily on 2026-10-11: optimal is 3 guesses, budget is 6
const UTAH_TO_TENNESSEE_PATHS = [
	['Utah', 'Wyoming', 'Nebraska', 'Missouri', 'Tennessee'],
	['Utah', 'Colorado', 'Nebraska', 'Missouri', 'Tennessee'],
	['Utah', 'Colorado', 'Kansas', 'Missouri', 'Tennessee'],
	['Utah', 'Colorado', 'Oklahoma', 'Missouri', 'Tennessee'],
	['Utah', 'Colorado', 'Oklahoma', 'Arkansas', 'Tennessee']
];

beforeEach(() => {
	// findShortestPath logs console.error for empty / impossible input, keep test output clean
	vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
	startState.set('');
	targetState.set('');
	guessedStates.set([]);
});

describe('findShortestPath', () => {
	it('returns the first shortest path found by bfs', () => {
		expect(findShortestPath('Utah', 'Tennessee')).toEqual(UTAH_TO_TENNESSEE_PATHS[0]);
		expect(findShortestPath('Washington', 'Minnesota')).toEqual([
			'Washington',
			'Idaho',
			'Montana',
			'North Dakota',
			'Minnesota'
		]);
	});

	it('returns the start alone when start and target are the same', () => {
		expect(findShortestPath('Texas', 'Texas')).toEqual(['Texas']);
	});

	it('returns null for empty input', () => {
		expect(findShortestPath('', 'Texas')).toBeNull();
		expect(findShortestPath('Texas', '')).toBeNull();
	});

	it('returns a connected path for every pair of states', () => {
		const states = Object.keys(statesGraph);
		for (const start of states) {
			for (const target of states) {
				const path = findShortestPath(start, target)!;
				expect(path[0]).toBe(start);
				expect(path[path.length - 1]).toBe(target);
				expect(isConnectedPath(path), path.join(' -> ')).toBe(true);
			}
		}
	});
});

describe('findAllShortestPaths', () => {
	it('returns every shortest path', () => {
		expect(findAllShortestPaths('Utah', 'Tennessee')).toEqual(UTAH_TO_TENNESSEE_PATHS);
		expect(findAllShortestPaths('Wyoming', 'Florida')).toEqual([
			['Wyoming', 'Nebraska', 'Missouri', 'Tennessee', 'Georgia', 'Florida'],
			['Wyoming', 'Nebraska', 'Missouri', 'Tennessee', 'Alabama', 'Florida']
		]);
	});

	it('agrees with findShortestPath on length and includes its path', () => {
		const states = Object.keys(statesGraph);
		for (const start of states) {
			for (const target of states) {
				if (start === target) continue;
				const shortest = findShortestPath(start, target)!;
				const all = findAllShortestPaths(start, target);
				expect(all.length).toBeGreaterThan(0);
				expect(all).toContainEqual(shortest);
				for (const path of all) {
					expect(path).toHaveLength(shortest.length);
					expect(isConnectedPath(path)).toBe(true);
				}
			}
		}
	});

	it('returns an empty list for empty input', () => {
		expect(findAllShortestPaths('', 'Texas')).toEqual([]);
	});
});

describe('getGuessScore', () => {
	const paths = findAllShortestPaths('Wyoming', 'Florida');

	it('is green when the guess is on any shortest path', () => {
		expect(getGuessScore('Nebraska', paths)).toBe('green');
		expect(getGuessScore('Alabama', paths)).toBe('green');
	});

	it('is orange when the guess borders a state on a shortest path', () => {
		expect(getGuessScore('Kansas', paths)).toBe('orange');
	});

	// v1 rule kept on purpose: the start and target count, so a state next to the start
	// is orange even when it points the wrong way
	it('is orange when the guess only borders the start', () => {
		expect(getGuessScore('Montana', paths)).toBe('orange');
		expect(getGuessScore('Idaho', paths)).toBe('orange');
	});

	it('is red otherwise', () => {
		expect(getGuessScore('Maine', paths)).toBe('red');
	});

	it('is red when there are no paths', () => {
		expect(getGuessScore('Nebraska', [])).toBe('red');
	});

	it('matches isInAnyShortestPath for green', () => {
		expect(isInAnyShortestPath('Nebraska', paths)).toBe(true);
		expect(isInAnyShortestPath('Kansas', paths)).toBe(false);
	});
});

describe('getRandomStatePair (practice puzzles)', () => {
	it('always picks 2 to 5 states in between', () => {
		for (let i = 0; i < 300; i++) {
			const { start, target, length } = getRandomStatePair();
			expect(start).not.toBe(target);
			expect(length).toBeGreaterThanOrEqual(2);
			expect(length).toBeLessThanOrEqual(5);
			expect(findShortestPath(start, target)!.length - 2).toBe(length);
		}
	});
});

describe('formatStateName', () => {
	it('trims, collapses spaces and capitalizes each word', () => {
		expect(formatStateName('  new   york ')).toBe('New York');
		expect(formatStateName('TEXAS')).toBe('Texas');
		expect(formatStateName('north carolina')).toBe('North Carolina');
	});
});

describe('resetGame', () => {
	it('clears guesses and sets a new practice puzzle with a budget of optimal + 3', () => {
		guessedStates.set(['Texas']);
		guessCount.set(1);
		modalShownPractice.set(true);

		resetGame();

		const start = get(startState);
		const target = get(targetState);
		const optimal = findShortestPath(start, target)!.length - 2;
		expect(get(guessedStates)).toEqual([]);
		expect(get(guessCount)).toBe(0);
		expect(get(initialGuessesRemaining)).toBe(optimal + 3);
		expect(get(modalShownPractice)).toBe(false);
	});
});

describe('gameStatus (win / lose rules)', () => {
	it('is waiting until a puzzle is set', () => {
		expect(statusFor('', '', [])).toBe('waiting');
	});

	it('is playing with no guesses', () => {
		expect(statusFor('Utah', 'Tennessee', [])).toBe('playing');
	});

	it('wins with the bfs path in the optimal number of guesses', () => {
		expect(statusFor('Utah', 'Tennessee', ['Wyoming', 'Nebraska', 'Missouri'])).toBe('win');
	});

	it('wins regardless of guess order', () => {
		expect(statusFor('Utah', 'Tennessee', ['Missouri', 'Wyoming', 'Nebraska'])).toBe('win');
	});

	it('wins with a different path of the same length', () => {
		expect(statusFor('Utah', 'Tennessee', ['Colorado', 'Oklahoma', 'Arkansas'])).toBe('win');
	});

	it('is a sub-win with a valid path that uses extra guesses', () => {
		expect(statusFor('Utah', 'Tennessee', ['Maine', 'Wyoming', 'Nebraska', 'Missouri'])).toBe(
			'sub-win'
		);
	});

	it('is a sub-win when the path is completed on the last guess', () => {
		const guesses = ['Maine', 'Ohio', 'Texas', 'Wyoming', 'Nebraska', 'Missouri'];
		expect(statusFor('Utah', 'Tennessee', guesses)).toBe('sub-win');
	});

	it('keeps playing while guesses remain and no path exists', () => {
		expect(statusFor('Utah', 'Tennessee', ['Wyoming', 'Nebraska'])).toBe('playing');
	});

	it('loses when the budget (optimal + 3) is used without a path', () => {
		const guesses = ['Maine', 'Florida', 'Texas', 'Ohio', 'Oregon', 'Vermont'];
		expect(statusFor('Utah', 'Tennessee', guesses)).toBe('lose');
	});

	it('sets the guess budget to optimal + 3', () => {
		statusFor('Utah', 'Tennessee', []);
		expect(get(initialGuessesRemaining)).toBe(6);
	});

	// known v1 bug 1: the lose check is `=== maxGuesses`, so a guess past the budget
	// (possible through the enter key after the game ends) returns the game to playing
	it.fails('stays finished when guesses go past the budget', () => {
		const guesses = ['Maine', 'Florida', 'Texas', 'Ohio', 'Oregon', 'Vermont', 'Iowa'];
		expect(statusFor('Utah', 'Tennessee', guesses)).not.toBe('playing');
	});
});
