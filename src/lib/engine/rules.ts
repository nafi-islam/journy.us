// win / lose rules and the guess guide (ported from v1 utils.ts, logic unchanged)

import { statesGraph, type StatesGraph } from './statesGraph';
import { findShortestPath } from './search';

export type GameStatusType = 'waiting' | 'playing' | 'win' | 'sub-win' | 'lose' | 'error';

export type GuessScore = 'green' | 'orange' | 'red';

export interface GameEvaluation {
	status: GameStatusType;
	message: string;
	optimalGuesses: number; // states between start and target on a shortest path
	maxGuesses: number; // optimal + 3
	shortestPath: string[];
}

// guess wiggle room on top of the optimal number of guesses
export const EXTRA_GUESSES = 3;

// Function to check if a game status means the game is over
export function isGameOver(status: GameStatusType): boolean {
	return status === 'win' || status === 'sub-win' || status === 'lose';
}

// Function to check if a game status is a win (optimal or not)
export function isWin(status: GameStatusType): boolean {
	return status === 'win' || status === 'sub-win';
}

// Function to check if a guessed state is in any of the shortest paths
export function isInAnyShortestPath(guess: string, paths: string[][]): boolean {
	return paths.some((path) => path.includes(guess));
}

// Function to check if all in-between states in the shortest path exist in guessed states
function containsAllElements(arr1: string[], arr2: string[]): boolean {
	return arr1.every((state) => arr2.includes(state));
}

// Function to check if the guessed path is a valid path from start to target
// Note: guesses can be out of order but must be connected
export function isValidAlternativePath(
	guessed: string[],
	start: string,
	target: string,
	graph: StatesGraph = statesGraph
): boolean {
	if (guessed.length === 0) return false;

	// Create a graph of guessed states + start and target
	const guessedSet = new Set([start, ...guessed, target]);

	// BFS to check if guessed states form a connected path
	const queue: string[] = [start];
	const visited = new Set<string>();

	while (queue.length > 0) {
		const currentState = queue.shift()!;
		visited.add(currentState);

		// If we reached the target, the path is valid
		if (currentState === target) return true;

		// Explore only guessed states
		for (const neighbor of graph[currentState] || []) {
			if (!visited.has(neighbor) && guessedSet.has(neighbor)) {
				queue.push(neighbor);
			}
		}
	}

	// If BFS couldn't reach the target, return false
	return false;
}

// Function to check if a guessed state is on the path, adjacent, or not at all to any state in any shortest path
export function getGuessScore(
	guess: string,
	shortestPaths: string[][],
	graph: StatesGraph = statesGraph
): GuessScore {
	if (!shortestPaths.length) return 'red';

	if (isInAnyShortestPath(guess, shortestPaths)) return 'green';

	// Check if guess is adjacent to any state in any shortest path
	for (const path of shortestPaths) {
		for (const state of path) {
			if (graph[state]?.includes(guess)) {
				return 'orange';
			}
		}
	}

	return 'red';
}

// Function to evaluate a game from its start, target and guesses (v1 gameStatus, no side effects)
export function evaluateGame(
	start: string,
	target: string,
	guessed: string[],
	graph: StatesGraph = statesGraph
): GameEvaluation {
	const empty = { optimalGuesses: 0, maxGuesses: 0, shortestPath: [] };

	if (!start || !target) return { status: 'waiting', message: '', ...empty };

	const shortestPath = findShortestPath(start, target, graph);

	// Won't happen after prompt bug fix
	if (!shortestPath) {
		return {
			status: 'error',
			message: `No valid path from ${start} to ${target}`,
			...empty
		};
	}

	// Extract the in-between states in the shortest path
	const intermediateStates = shortestPath.slice(1, -1);

	const optimalGuesses = shortestPath.length - 2; // -2 to exclude start and target
	const maxGuesses = optimalGuesses + EXTRA_GUESSES;
	const currentGuessCount = guessed.length;
	const remainingGuesses = maxGuesses - currentGuessCount;
	const result = (status: GameStatusType, message: string): GameEvaluation => ({
		status,
		message,
		optimalGuesses,
		maxGuesses,
		shortestPath
	});
	const optimalPathText = `Optimal path: ${shortestPath.join(' ➡️ ')}`;
	const isValidPath = isValidAlternativePath(guessed, start, target, graph);

	// Win Condition #1 (optimal): findShortestPath generated shortest path
	if (
		intermediateStates.length > 0 && // Ensure BFS path has intermediates
		containsAllElements(intermediateStates, guessed) && // Ensure all BFS states are guessed
		currentGuessCount === optimalGuesses // Ensure player used the exact number of guesses
	) {
		return result('win', `Win Triggered: Condition - Found BFS optimal path. ${optimalPathText}`);
	}

	// Win Condition #2 (optimal): Same length as findShortestPath generated path
	if (isValidPath && currentGuessCount === optimalGuesses) {
		return result(
			'win',
			`Win Triggered: Condition - Found another optimal path. ${optimalPathText}`
		);
	}

	// Win Condition #3 (sub-optimal): check alternative valid paths
	if (isValidPath && currentGuessCount > optimalGuesses && currentGuessCount <= maxGuesses) {
		return result(
			'sub-win',
			`Win Triggered: Condition - Found sub optimal path. ${optimalPathText}`
		);
	}

	// Lose Condition: If guesses reach maxGuesses
	// (>= instead of v1's === so extra guesses can never return the game to playing)
	if (currentGuessCount >= maxGuesses) {
		return result('lose', `Loss Triggered: Condition - No guesses remaining. ${optimalPathText}`);
	}

	// Continue
	return result('playing', `Keep guessing! ${remainingGuesses} guesses left.`);
}
