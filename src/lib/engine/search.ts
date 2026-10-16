// breadth-first search over the states graph (ported from v1 utils.ts)
// every function takes an optional graph so legacy daily puzzles can use the v1 graph

import { statesGraph, type StatesGraph } from './statesGraph';

// Function to find the shortest path using BFS
// returns the first shortest path found (order follows the adjacency list)
export function findShortestPath(
	start: string,
	target: string,
	graph: StatesGraph = statesGraph
): string[] | null {
	if (!start || !target) {
		console.error('findShortestPath called with empty states!');
		return null;
	}

	if (start === target) {
		return [start];
	}

	const queue: [string, string[]][] = [[start, [start]]];
	const visited = new Set<string>([start]);

	while (queue.length > 0) {
		const [currentState, path] = queue.shift()!;

		for (const neighbor of graph[currentState] || []) {
			if (!visited.has(neighbor)) {
				const newPath = [...path, neighbor];

				if (neighbor === target) {
					return newPath;
				}

				queue.push([neighbor, newPath]);
				visited.add(neighbor);
			}
		}
	}

	console.error(`No valid path found from ${start} to ${target}`);
	return null;
}

// Function to find all shortest paths using BFS
export function findAllShortestPaths(
	start: string,
	target: string,
	graph: StatesGraph = statesGraph
): string[][] {
	if (!start || !target) return [];

	const queue: [string, string[]][] = [[start, [start]]];
	const paths: string[][] = [];
	const visited = new Map<string, number>();
	let shortestLength = Infinity;

	while (queue.length > 0) {
		const [current, path] = queue.shift()!;

		if (path.length > shortestLength) continue;

		if (current === target) {
			if (path.length < shortestLength) {
				shortestLength = path.length;
				paths.length = 0; // reset shorter paths
			}
			paths.push(path);
			continue;
		}

		for (const neighbor of graph[current] || []) {
			if (!visited.has(neighbor) || visited.get(neighbor)! >= path.length + 1) {
				visited.set(neighbor, path.length + 1);
				queue.push([neighbor, [...path, neighbor]]);
			}
		}
	}

	return paths;
}

// Function to count the states strictly between start and target on a shortest path
// (the "optimal" number of guesses). returns null when there is no path
export function countStatesBetween(
	start: string,
	target: string,
	graph: StatesGraph = statesGraph
): number | null {
	const path = findShortestPath(start, target, graph);
	return path ? path.length - 2 : null;
}
