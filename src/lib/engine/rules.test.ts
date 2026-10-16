// tests for the win / lose rules and the guess guide (v1 logic)

import { describe, expect, it } from 'vitest';
import { findAllShortestPaths } from './search';
import {
	evaluateGame,
	getGuessScore,
	isGameOver,
	isInAnyShortestPath,
	isValidAlternativePath,
	isWin
} from './rules';

// Function to get just the status for a utah -> tennessee game (optimal 3, budget 6)
function statusFor(guesses: string[]): string {
	return evaluateGame('Utah', 'Tennessee', guesses).status;
}

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

describe('isValidAlternativePath', () => {
	it('accepts guesses in any order as long as they connect', () => {
		expect(isValidAlternativePath(['Missouri', 'Wyoming', 'Nebraska'], 'Utah', 'Tennessee')).toBe(
			true
		);
	});

	it('rejects guesses that do not connect start to target', () => {
		expect(isValidAlternativePath(['Wyoming', 'Missouri'], 'Utah', 'Tennessee')).toBe(false);
		expect(isValidAlternativePath([], 'Utah', 'Tennessee')).toBe(false);
	});
});

describe('evaluateGame (win / lose rules)', () => {
	it('is waiting until a puzzle is set', () => {
		expect(evaluateGame('', '', []).status).toBe('waiting');
	});

	it('is playing with no guesses', () => {
		expect(statusFor([])).toBe('playing');
	});

	it('reports optimal + 3 guesses and the bfs path', () => {
		const evaluation = evaluateGame('Utah', 'Tennessee', []);
		expect(evaluation.optimalGuesses).toBe(3);
		expect(evaluation.maxGuesses).toBe(6);
		expect(evaluation.shortestPath).toEqual([
			'Utah',
			'Wyoming',
			'Nebraska',
			'Missouri',
			'Tennessee'
		]);
	});

	it('wins with the bfs path in the optimal number of guesses', () => {
		expect(statusFor(['Wyoming', 'Nebraska', 'Missouri'])).toBe('win');
	});

	it('wins regardless of guess order', () => {
		expect(statusFor(['Missouri', 'Wyoming', 'Nebraska'])).toBe('win');
	});

	it('wins with a different path of the same length', () => {
		expect(statusFor(['Colorado', 'Oklahoma', 'Arkansas'])).toBe('win');
	});

	it('is a sub-win with a valid path that uses extra guesses', () => {
		expect(statusFor(['Maine', 'Wyoming', 'Nebraska', 'Missouri'])).toBe('sub-win');
	});

	it('is a sub-win when the path is completed on the last guess', () => {
		expect(statusFor(['Maine', 'Ohio', 'Texas', 'Wyoming', 'Nebraska', 'Missouri'])).toBe(
			'sub-win'
		);
	});

	it('keeps playing while guesses remain and no path exists', () => {
		expect(statusFor(['Wyoming', 'Nebraska'])).toBe('playing');
	});

	it('loses when the budget (optimal + 3) is used without a path', () => {
		expect(statusFor(['Maine', 'Florida', 'Texas', 'Ohio', 'Oregon', 'Vermont'])).toBe('lose');
	});

	// v1 bug: the lose check was `=== maxGuesses`, so extra guesses returned the game to playing
	it('stays finished when guesses go past the budget', () => {
		expect(statusFor(['Maine', 'Florida', 'Texas', 'Ohio', 'Oregon', 'Vermont', 'Iowa'])).toBe(
			'lose'
		);
	});

	it('keeps the v1 message format (PracticeModal reads the optimal path from it)', () => {
		const { message } = evaluateGame('Utah', 'Tennessee', ['Wyoming', 'Nebraska', 'Missouri']);
		expect(message).toMatch(/Optimal path: Utah ➡️ Wyoming ➡️ Nebraska ➡️ Missouri ➡️ Tennessee$/);
	});
});

describe('isGameOver / isWin', () => {
	it('treats win, sub-win and lose as over', () => {
		expect(['win', 'sub-win', 'lose'].every((s) => isGameOver(s as never))).toBe(true);
		expect(['waiting', 'playing', 'error'].some((s) => isGameOver(s as never))).toBe(false);
	});

	it('treats win and sub-win as wins', () => {
		expect(isWin('win')).toBe(true);
		expect(isWin('sub-win')).toBe(true);
		expect(isWin('lose')).toBe(false);
	});
});
