// tests for the daily puzzle (legacy json before SWITCH_DATE, generated from the date after)

import { describe, expect, it } from 'vitest';
import challenges from '../../../static/validChallenges.json';
import { addDays, localDateKey, utcDateKey } from './dates';
import { findShortestPath } from './search';
import { statesGraph } from './statesGraph';
import { legacyStatesGraph, type LegacyChallenges } from './legacy';
import {
	MAX_STATES_BETWEEN,
	MIN_STATES_BETWEEN,
	REPEAT_WINDOW,
	SWITCH_DATE,
	getDailyGraph,
	getDailyPool,
	getGeneratedPuzzle,
	getLegacyPuzzle,
	getTodayKey,
	isLegacyDate
} from './daily';

// Function to get a pair's key that ignores direction (a -> b is the same pair as b -> a)
function pairKey(start: string, target: string): string {
	return [start, target].sort().join('|');
}

describe('SWITCH_DATE', () => {
	it('is the v2 cutover day, 2026-11-01', () => {
		expect(SWITCH_DATE).toBe('2026-11-01');
	});

	it('has a v1 json puzzle for every day before the switch (no gap, never later than the json)', () => {
		const lastLegacyDate = Object.keys(challenges).sort().pop()!;
		expect(SWITCH_DATE <= addDays(lastLegacyDate, 1)).toBe(true);
		for (let date = '2025-04-07'; date < SWITCH_DATE; date = addDays(date, 1)) {
			expect(getLegacyPuzzle(date, challenges as LegacyChallenges), date).not.toBeNull();
		}
	});

	it('splits legacy and generated dates', () => {
		expect(isLegacyDate('2026-10-31')).toBe(true);
		expect(isLegacyDate(SWITCH_DATE)).toBe(false);
		expect(getDailyGraph('2026-10-17')).toBe(legacyStatesGraph);
		expect(getDailyGraph(SWITCH_DATE)).toBe(statesGraph);
	});
});

describe('getTodayKey', () => {
	const switchDate = '2027-01-01';

	it('uses the utc date before the switch (v1 behavior)', () => {
		const now = new Date('2026-10-11T02:31:00Z');
		expect(getTodayKey(now, switchDate)).toBe(utcDateKey(now));
	});

	it("uses the player's local date after the switch", () => {
		const now = new Date('2027-06-15T03:00:00Z');
		expect(getTodayKey(now, switchDate)).toBe(localDateKey(now));
	});

	it('never goes back a day around the switch', () => {
		// walk an hour at a time across the switch: the key must never decrease
		let previous = '';
		for (let hour = -48; hour <= 48; hour++) {
			const now = new Date(Date.UTC(2027, 0, 1) + hour * 3600 * 1000);
			const key = getTodayKey(now, switchDate);
			if (previous) expect(key >= previous, `${previous} -> ${key}`).toBe(true);
			previous = key;
		}
	});
});

describe('getDailyPool', () => {
	it('has every pair with 3 to 5 states in between, each pair once', () => {
		const pool = getDailyPool();
		expect(pool).toHaveLength(465);
		expect(new Set(pool.map(([a, b]) => pairKey(a, b))).size).toBe(465);
		for (const [a, b] of pool) {
			const between = findShortestPath(a, b, statesGraph)!.length - 2;
			expect(between).toBeGreaterThanOrEqual(MIN_STATES_BETWEEN);
			expect(between).toBeLessThanOrEqual(MAX_STATES_BETWEEN);
		}
	});
});

describe('getGeneratedPuzzle', () => {
	// pinned puzzles: if one of these changes, every player's daily changed. that should never
	// happen after release (don't touch DAILY_SALT, the pool rules or the shuffle)
	it('is pinned for known dates', () => {
		const pinned = [
			['2026-11-01', 574, 'South Dakota', 'Maryland'],
			['2030-04-06', 1826, 'North Carolina', 'Washington'],
			['2030-04-07', 1827, 'Kentucky', 'Rhode Island'],
			['2031-01-01', 2096, 'Wyoming', 'South Carolina'],
			['2100-01-01', 27298, 'Virginia', 'Utah']
		] as const;
		for (const [dateKey, challengeNumber, start, target] of pinned) {
			expect(getGeneratedPuzzle(dateKey)).toMatchObject({ challengeNumber, start, target });
		}
	});

	it('is the same every time for the same date', () => {
		expect(getGeneratedPuzzle('2031-05-05')).toEqual(getGeneratedPuzzle('2031-05-05'));
	});

	it('makes valid puzzles on the current graph for 4 years (3+ cycles)', () => {
		let dateKey = SWITCH_DATE;
		for (let i = 0; i < 1500; i++) {
			const puzzle = getGeneratedPuzzle(dateKey);
			const between = puzzle.shortestPath.length - 2;
			expect(puzzle.source).toBe('generated');
			expect(puzzle.graph).toBe(statesGraph);
			expect(puzzle.shortestPath[0]).toBe(puzzle.start);
			expect(puzzle.shortestPath[puzzle.shortestPath.length - 1]).toBe(puzzle.target);
			expect(between).toBeGreaterThanOrEqual(MIN_STATES_BETWEEN);
			expect(between).toBeLessThanOrEqual(MAX_STATES_BETWEEN);
			dateKey = addDays(dateKey, 1);
		}
	});

	it(`never repeats a pair (either direction) within ${REPEAT_WINDOW} days, across cycles`, () => {
		const lastSeen = new Map<string, number>();
		let dateKey = SWITCH_DATE;
		for (let day = 0; day < 2000; day++) {
			const { start, target } = getGeneratedPuzzle(dateKey);
			const key = pairKey(start, target);
			const seen = lastSeen.get(key);
			if (seen !== undefined) {
				expect(day - seen, `${key} repeated on ${dateKey}`).toBeGreaterThan(REPEAT_WINDOW);
			}
			lastSeen.set(key, day);
			dateKey = addDays(dateKey, 1);
		}
	});

	it('uses every pair exactly once per cycle', () => {
		// cycle 4 starts at day index 4 * 465 = 1860 after 2025-04-07
		let dateKey = addDays('2025-04-07', 4 * 465);
		const seen = new Set<string>();
		for (let i = 0; i < 465; i++) {
			const { start, target } = getGeneratedPuzzle(dateKey);
			seen.add(pairKey(start, target));
			dateKey = addDays(dateKey, 1);
		}
		expect(seen.size).toBe(465);
	});

	it('keeps a difficulty mix close to v1 (about 42 / 32 / 26%)', () => {
		// one full cycle uses every pair once, so the mix is exactly the pool's mix
		// (cycle 4 starts at day index 4 * 465 after 2025-04-07)
		const mix = { 3: 0, 4: 0, 5: 0 } as Record<number, number>;
		let dateKey = addDays('2025-04-07', 4 * 465);
		for (let i = 0; i < 465; i++) {
			mix[getGeneratedPuzzle(dateKey).shortestPath.length - 2]++;
			dateKey = addDays(dateKey, 1);
		}
		// the cycle's mix is exactly the pool's mix
		const poolMix = { 3: 0, 4: 0, 5: 0 } as Record<number, number>;
		for (const [a, b] of getDailyPool()) poolMix[findShortestPath(a, b, statesGraph)!.length - 2]++;
		expect(mix).toEqual(poolMix);

		// about 42 / 32 / 26% like v1's json (768 / 599 / 458 of 1,825)
		expect(Math.round((mix[3] / 465) * 100)).toBe(42);
		expect(Math.round((mix[4] / 465) * 100)).toBe(32);
		expect(Math.round((mix[5] / 465) * 100)).toBe(26);
	});
});

describe('getLegacyPuzzle', () => {
	it('reads a v1 daily from the json on the v1 graph', () => {
		expect(getLegacyPuzzle('2026-10-11', challenges as LegacyChallenges)).toEqual({
			dateKey: '2026-10-11',
			challengeNumber: 553,
			start: 'Utah',
			target: 'Tennessee',
			shortestPath: ['Utah', 'Wyoming', 'Nebraska', 'Missouri', 'Tennessee'],
			graph: legacyStatesGraph,
			source: 'legacy'
		});
	});

	it('returns null for a date that is not in the json', () => {
		expect(getLegacyPuzzle('2030-04-06', challenges as LegacyChallenges)).toBeNull();
	});
});
