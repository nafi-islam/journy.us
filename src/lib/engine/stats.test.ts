// tests for daily statistics

import { describe, expect, it } from 'vitest';
import { computeStats, type DailyResult, type StatsHistory } from './stats';

// Function to build a v1-shaped history entry
function entry(won: boolean, guessCount = 3): DailyResult {
	return { won, guessCount, shortestPathLength: 3, isDaily: true };
}

describe('computeStats', () => {
	it('returns zeros (not NaN) for a brand new player', () => {
		expect(computeStats({}, '2026-10-11')).toEqual({
			gamesPlayed: 0,
			winRate: 0,
			currentStreak: 0,
			maxStreak: 0,
			guessDistribution: [0, 0, 0, 0, 0, 0, 0, 0]
		});
	});

	it('counts played, win rate and the guess distribution (wins only) like v1', () => {
		const history: StatsHistory = {
			'2026-10-08': entry(true, 3),
			'2026-10-09': entry(true, 4),
			'2026-10-10': entry(false, 6),
			'2026-10-11': entry(true, 3)
		};
		const stats = computeStats(history, '2026-10-11');
		expect(stats.gamesPlayed).toBe(4);
		expect(stats.winRate).toBe(75);
		expect(stats.guessDistribution).toEqual([0, 0, 2, 1, 0, 0, 0, 0]);
	});

	it('counts wins on consecutive days as a streak', () => {
		const history = {
			'2026-10-09': entry(true),
			'2026-10-10': entry(true),
			'2026-10-11': entry(true)
		};
		expect(computeStats(history, '2026-10-11')).toMatchObject({ currentStreak: 3, maxStreak: 3 });
	});

	it('resets the streak on a loss (v1 behavior)', () => {
		const history = {
			'2026-10-07': entry(true),
			'2026-10-08': entry(true),
			'2026-10-10': entry(false),
			'2026-10-11': entry(true)
		};
		expect(computeStats(history, '2026-10-11')).toMatchObject({ currentStreak: 1, maxStreak: 2 });
	});

	// v1 bug 3: skipped days didn't break the streak (this history showed 4)
	it('resets the streak on a skipped day', () => {
		const history = {
			'2026-10-07': entry(true),
			'2026-10-08': entry(true),
			'2026-10-10': entry(true),
			'2026-10-11': entry(true)
		};
		expect(computeStats(history, '2026-10-11')).toMatchObject({ currentStreak: 2, maxStreak: 2 });
	});

	it('keeps the current streak alive until today is played', () => {
		const history = { '2026-10-09': entry(true), '2026-10-10': entry(true) };
		expect(computeStats(history, '2026-10-11').currentStreak).toBe(2);
	});

	it('drops the current streak when the last win is older than yesterday', () => {
		const history = { '2026-10-01': entry(true), '2026-10-02': entry(true) };
		expect(computeStats(history, '2026-10-11')).toMatchObject({ currentStreak: 0, maxStreak: 2 });
	});
});
