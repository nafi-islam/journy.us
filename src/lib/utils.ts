import { derived } from 'svelte/store';
import { statesGraph } from './statesGraph';
import {
	startState,
	targetState,
	guessedStates,
	guessesRemaining,
	guessCount,
	initialGuessesRemaining
} from './stores';

// Function to clean the user input
export function formatStateName(state: string): string {
	return state
		.trim()
		.split(/\s+/) // Split by spaces
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
		.join(' '); // Rejoin into a proper state name
}

// Function to find the shortest path using BFS
export function findShortestPath(start: string, target: string): string[] | null {
	if (!start || !target) {
		console.error('findShortestPath called with empty states!');
		return null;
	}

	console.log(`Running findShortestPath from ${start} to ${target}`);

	// Eventually fix this in prompt so this won't ever happen
	if (start === target) {
		console.log(`Start and target are the same: ${start}`);
		return [start];
	}

	const queue: [string, string[]][] = [[start, [start]]];
	const visited = new Set<string>([start]);

	while (queue.length > 0) {
		const [currentState, path] = queue.shift()!;

		for (const neighbor of statesGraph[currentState] || []) {
			if (!visited.has(neighbor)) {
				const newPath = [...path, neighbor];

				if (neighbor === target) {
					console.log(`Found shortest path: ${newPath.join(' → ')}`);
					return newPath;
				}

				queue.push([neighbor, newPath]);
				visited.add(neighbor);
			}
		}
	}

	console.error(`No valid path found from ${start} to ${target}`); // won't happen after prompt fix
	return null;
}

// Function to check if all in-between states in the shortest path exist in guessed states
function containsAllElements(arr1: string[], arr2: string[]): boolean {
	return arr1.every((state) => arr2.includes(state));
}

// TODO (BREAKING): Function to check if the guessed path is a valid path from start to target
// Note: guesses can be out of order but must be connected
function isValidAlternativePath(guessed: string[], start: string, target: string): boolean {
	if (guessed.length === 0) return false;
	if (!statesGraph[start]?.includes(guessed[0])) return false; // First guess must connect to start

	let currentState = start;

	// Check adjacency between guessed states
	for (let i = 0; i < guessed.length; i++) {
		if (!statesGraph[currentState]?.includes(guessed[i])) {
			return false; // If a guessed state is not adjacent, it's invalid
		}
		currentState = guessed[i];
	}

	// Last guess must connect to the target
	return statesGraph[currentState]?.includes(target);
}

// Deriving game status dynamically
export const gameStatus = derived(
	[startState, targetState, guessedStates],
	([$startState, $targetState, $guessedStates]) => {
		if (!$startState || !$targetState) return { status: 'waiting', message: '' };

		const shortestPath = findShortestPath($startState, $targetState);

		// Extract the in-between states in the shortest path
		const intermediateStates = shortestPath ? shortestPath.slice(1, -1) : [];

		// Won't happen after prompt bug fix
		if (!shortestPath) {
			console.error(`No valid path found from ${$startState} to ${$targetState}`);
			return { status: 'error', message: `No valid path from ${$startState} to ${$targetState}` };
		}

		console.log(
			`Shortest Path from ${$startState} to ${$targetState}: ${shortestPath.join(' → ')}`
		);
		console.log(`Guessed States: ${$guessedStates.join(' → ')}`);

		const optimalGuesses = shortestPath.length - 2; // // -2 to exclude start and target
		const maxGuesses = optimalGuesses + 3; // guess wiggle room
		const currentGuessCount = $guessedStates.length;
		const initialRemainingGuesses = maxGuesses; // used for prompt
		const remainingGuesses = maxGuesses - currentGuessCount;

		initialGuessesRemaining.set(initialRemainingGuesses);
		// guessesRemaining.set(remainingGuesses); // don't think I need to store this now that I have initialRemainingGuesses
		guessCount.set(currentGuessCount);

		// Check if guessed path is a valid path from start to target
		const isValidPath = isValidAlternativePath($guessedStates, $startState, $targetState);

		// Win Condition #1 (optimal): findShortestPath generated shortest path
		if (intermediateStates.length > 0 && containsAllElements(intermediateStates, $guessedStates)) {
			console.log(`Optimal win triggered`);
			return {
				status: 'win',
				message: `Win Triggered: Condition - Found BFS optimal path. Optimal path: ${shortestPath.join(' → ')}`
			};
		}

		// Win Condition #2 (optimal): Same length as findShortestPath generated path
		// prettier-ignore
		if (isValidPath && (currentGuessCount === optimalGuesses)) {
			console.log(`Optimal win triggered`);
			return {
				status: 'win',
				message: `Win Triggered: Condition - Found another optimal path. Optimal path: ${shortestPath.join(' → ')}`
			};
		}

		// Win Condition #3 (sub-optimal): check alternative valid paths
		// prettier-ignore
		if (isValidPath && ((currentGuessCount > optimalGuesses) && (currentGuessCount <= maxGuesses))) {
			console.log(`Sub-win triggered`);
			return {
				status: 'sub-win',
				message: `Win Triggered: Condition - Found sub optimal path. Optimal path: ${shortestPath.join(' → ')}`
			};
		}

		// Lose Condition: If guesses exceed maxGuesses
		if (currentGuessCount === maxGuesses) {
			console.log(`Loss triggered`);
			return {
				status: 'lose',
				message: `Loss Triggered: Condition - No guesses remaining. Optimal path: ${shortestPath.join(' → ')}`
			};
		}

		// Continue
		return {
			status: 'playing',
			message: `Keep guessing! ${remainingGuesses} guesses left.`
		};
	}
);
