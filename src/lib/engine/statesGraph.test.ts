// tests for the states graph (the map as nodes + edges)

import { describe, expect, it } from 'vitest';
import { statesGraph, type StatesGraph } from './statesGraph';
import { legacyStatesGraph } from './legacy';
import { statesGraph as generatorGraph } from '../../../generateValidChallenges/src/statesGraph';

const states = Object.keys(statesGraph);

// Function to count how many states can be reached from a start state
function reachableFrom(start: string, graph: StatesGraph): Set<string> {
	const visited = new Set<string>([start]);
	const queue = [start];

	while (queue.length > 0) {
		const current = queue.shift()!;
		for (const neighbor of graph[current]) {
			if (!visited.has(neighbor)) {
				visited.add(neighbor);
				queue.push(neighbor);
			}
		}
	}

	return visited;
}

// Function to count the borders in a graph
function countBorders(graph: StatesGraph): number {
	return Object.keys(graph).reduce((total, state) => total + graph[state].length, 0) / 2;
}

// Function to sort every neighbor list so graphs can be compared ignoring order
function sortedGraph(graph: StatesGraph): StatesGraph {
	return Object.fromEntries(Object.entries(graph).map(([state, n]) => [state, [...n].sort()]));
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
		expect(reachableFrom('Maine', statesGraph).size).toBe(48);
	});

	it('has 105 borders', () => {
		expect(countBorders(statesGraph)).toBe(105);
	});

	// the four corners only touch at a point, so neither diagonal is a border
	it('treats both four corners diagonals the same way (neither counts)', () => {
		expect(statesGraph['Arizona']).not.toContain('Colorado');
		expect(statesGraph['Utah']).not.toContain('New Mexico');
	});
});

describe('legacyStatesGraph (v1 graph for legacy daily puzzles)', () => {
	it('is the v1 graph: the current graph plus arizona-colorado', () => {
		expect(countBorders(legacyStatesGraph)).toBe(106);
		expect(legacyStatesGraph['Arizona']).toContain('Colorado');
		expect(legacyStatesGraph['Colorado']).toContain('Arizona');
	});

	it('matches the copy used by generateValidChallenges (ignoring neighbor order)', () => {
		expect(sortedGraph(legacyStatesGraph)).toEqual(sortedGraph(generatorGraph));
	});

	it('does not change the current graph', () => {
		expect(statesGraph['Arizona']).not.toContain('Colorado');
	});
});
