// practice puzzles (ported from v1 utils.ts)

import { statesGraph, type StatesGraph } from './statesGraph';
import { findShortestPath } from './search';

// Function to choose a valid start and target state for prompt
// choose a state that is at least 2 away and 5 at most (path of 4 to 7 states)
export function getRandomStatePair(graph: StatesGraph = statesGraph) {
	const states = Object.keys(graph);
	let start, target, shortestPath;

	do {
		start = states[Math.floor(Math.random() * states.length)];
		target = states[Math.floor(Math.random() * states.length)];
		shortestPath = findShortestPath(start, target, graph);
	} while (!shortestPath || shortestPath.length > 7 || shortestPath.length < 4);

	// length = states in between (excludes start and target)
	return { start, target, length: shortestPath.length - 2 };
}
