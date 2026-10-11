// tests for the states graph (the map as nodes + edges)
// these pin v1 behavior before the v2 refactor. see CLAUDE.md "how the game works"

import { describe, expect, it } from 'vitest';
import { statesGraph } from './statesGraph';
import { statesGraph as generatorGraph } from '../../generateValidChallenges/src/statesGraph';

const states = Object.keys(statesGraph);

// Function to count how many states can be reached from a start state
function reachableFrom(start: string): Set<string> {
	const visited = new Set<string>([start]);
	const queue = [start];

	while (queue.length > 0) {
		const current = queue.shift()!;
		for (const neighbor of statesGraph[current]) {
			if (!visited.has(neighbor)) {
				visited.add(neighbor);
				queue.push(neighbor);
			}
		}
	}

	return visited;
}

describe('statesGraph', () => {
	it('has the lower 48 states only', () => {
		expect(states).toHaveLength(48);
		expect(states).not.toContain('Alaska');
		expect(states).not.toContain('Hawaii');
	});

	it('only points to states that exist in the graph', () => {
		for (const state of states) {
			for (const neighbor of statesGraph[state]) {
				expect(states, `${state} -> ${neighbor}`).toContain(neighbor);
			}
		}
	});

	it('lists every border in both directions', () => {
		for (const state of states) {
			for (const neighbor of statesGraph[state]) {
				expect(statesGraph[neighbor], `${neighbor} is missing ${state}`).toContain(state);
			}
		}
	});

	it('has no self loops or duplicate neighbors', () => {
		for (const state of states) {
			expect(statesGraph[state]).not.toContain(state);
			expect(new Set(statesGraph[state]).size).toBe(statesGraph[state].length);
		}
	});

	it('is connected (every state can reach every other state)', () => {
		expect(reachableFrom('Maine').size).toBe(48);
	});

	it('has 106 borders in v1', () => {
		const edgeCount = states.reduce((total, state) => total + statesGraph[state].length, 0) / 2;
		expect(edgeCount).toBe(106);
	});

	it('matches the copy used by generateValidChallenges', () => {
		expect(generatorGraph).toEqual(statesGraph);
	});

	// known v1 issue: arizona-colorado is a border but utah-new mexico is not
	// the four corners only touch at a point (v2 decision: neither counts)
	it.fails('treats both four corners diagonals the same way', () => {
		const arizonaColorado = statesGraph['Arizona'].includes('Colorado');
		const utahNewMexico = statesGraph['Utah'].includes('New Mexico');
		expect(arizonaColorado).toBe(utahNewMexico);
	});
});
