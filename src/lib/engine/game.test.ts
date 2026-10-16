// tests for guess input handling

import { describe, expect, it } from 'vitest';
import { checkGuess, formatStateName, type GuessContext } from './game';

const playing: GuessContext = {
	start: 'Utah',
	target: 'Tennessee',
	guessed: ['Wyoming'],
	status: 'playing'
};

describe('formatStateName', () => {
	it('trims, collapses spaces and capitalizes each word', () => {
		expect(formatStateName('  new   york ')).toBe('New York');
		expect(formatStateName('TEXAS')).toBe('Texas');
		expect(formatStateName('north carolina')).toBe('North Carolina');
	});
});

describe('checkGuess', () => {
	it('accepts a valid new state and returns its clean name', () => {
		expect(checkGuess(' nebraska ', playing)).toEqual({ ok: true, state: 'Nebraska' });
	});

	it('rejects names that are not states in the graph', () => {
		expect(checkGuess('Narnia', playing)).toEqual({ ok: false, reason: 'invalid' });
		expect(checkGuess('Alaska', playing)).toEqual({ ok: false, reason: 'invalid' });
	});

	it('rejects empty input', () => {
		expect(checkGuess('   ', playing)).toEqual({ ok: false, reason: 'empty' });
	});

	it('rejects a state that was already guessed', () => {
		expect(checkGuess('wyoming', playing)).toEqual({ ok: false, reason: 'duplicate' });
	});

	it('rejects the start and target states', () => {
		expect(checkGuess('Utah', playing)).toEqual({ ok: false, reason: 'start-or-target' });
		expect(checkGuess('Tennessee', playing)).toEqual({ ok: false, reason: 'start-or-target' });
	});

	it('rejects any guess once the game is over (v1 bug 1)', () => {
		for (const status of ['win', 'sub-win', 'lose'] as const) {
			expect(checkGuess('Nebraska', { ...playing, status })).toEqual({
				ok: false,
				reason: 'game-over'
			});
		}
	});
});
