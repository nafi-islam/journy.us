// tests for practice puzzles

import { describe, expect, it } from 'vitest';
import { getRandomStatePair } from './practice';
import { findShortestPath } from './search';
import { statesGraph } from './statesGraph';

describe('getRandomStatePair', () => {
	it('always picks 2 to 5 states in between on the current graph', () => {
		for (let i = 0; i < 300; i++) {
			const { start, target, length } = getRandomStatePair();
			expect(start).not.toBe(target);
			expect(length).toBeGreaterThanOrEqual(2);
			expect(length).toBeLessThanOrEqual(5);
			expect(findShortestPath(start, target, statesGraph)!.length - 2).toBe(length);
		}
	});
});
