// tests for the v1 daily puzzles in static/validChallenges.json
// the file stays in use until SWITCH_DATE (v2 m2), so it must stay valid.
// these puzzles were generated with the v1 graph, so they are checked against legacyStatesGraph

import { describe, expect, it } from 'vitest';
import challenges from '../../../static/validChallenges.json';
import { legacyStatesGraph, type LegacyChallenges } from './legacy';
import { findShortestPath } from './search';

const daily = challenges as LegacyChallenges;
const dates = Object.keys(daily);
const ONE_DAY = 1000 * 60 * 60 * 24;

describe('validChallenges.json', () => {
	it('covers 1,825 days from 2025-04-07 (challenge #1) to 2030-04-05', () => {
		expect(dates).toHaveLength(1825);
		expect(dates[0]).toBe('2025-04-07');
		expect(dates[dates.length - 1]).toBe('2030-04-05');
	});

	it('has no missing days', () => {
		for (let i = 1; i < dates.length; i++) {
			const gap = new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime();
			expect(gap, `${dates[i - 1]} -> ${dates[i]}`).toBe(ONE_DAY);
		}
	});

	it('stores a real shortest path with 3 to 5 states in between', () => {
		for (const date of dates) {
			const { dailyStartState, dailyTargetState, dailyPathLength, shortestPath } = daily[date];

			expect(shortestPath[0], date).toBe(dailyStartState);
			expect(shortestPath[shortestPath.length - 1], date).toBe(dailyTargetState);
			expect(dailyPathLength, date).toBe(shortestPath.length - 2);
			expect(dailyPathLength, date).toBeGreaterThanOrEqual(3);
			expect(dailyPathLength, date).toBeLessThanOrEqual(5);

			// every step crosses a real border
			for (let i = 1; i < shortestPath.length; i++) {
				expect(legacyStatesGraph[shortestPath[i - 1]], date).toContain(shortestPath[i]);
			}

			// and nothing shorter exists
			const legacyPath = findShortestPath(dailyStartState, dailyTargetState, legacyStatesGraph);
			expect(legacyPath!.length, date).toBe(shortestPath.length);
		}
	});
});
