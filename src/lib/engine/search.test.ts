// tests for the bfs functions (ported from v1, behavior unchanged)

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { statesGraph } from './statesGraph';
import { legacyStatesGraph } from './legacy';
import { countStatesBetween, findAllShortestPaths, findShortestPath } from './search';

// Function to check that every step of a path crosses a real border
function isConnectedPath(path: string[]): boolean {
	return path.every((state, i) => i === 0 || statesGraph[path[i - 1]].includes(state));
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
	// findShortestPath logs console.error for empty input, keep test output clean
	vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
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

	it('uses the graph it is given (four corners only exist in the legacy graph)', () => {
		expect(findShortestPath('Arizona', 'Kansas')).toEqual([
			'Arizona',
			'Utah',
			'Colorado',
			'Kansas'
		]);
		expect(findShortestPath('Arizona', 'Kansas', legacyStatesGraph)).toEqual([
			'Arizona',
			'Colorado',
			'Kansas'
		]);
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

describe('countStatesBetween', () => {
	it('counts the states strictly between start and target', () => {
		expect(countStatesBetween('Utah', 'Tennessee')).toBe(3);
		expect(countStatesBetween('Texas', 'Oklahoma')).toBe(0);
	});
});
