import { derived, get } from 'svelte/store';
import { statesGraph } from './statesGraph';
import {
	startState,
	targetState,
	guessedStates,
	guessesRemaining,
	guessCount,
	initialGuessesRemaining,
	isLoading,
	mapLoaded,
	statesLoaded
} from './stores';

let loadingDelayApplied = false;

const states = Object.keys(statesGraph);

// Function to choose a valid start and target state for prompt
export function getRandomStatePair() {
	let start, target, shortestPath;

	do {
		start = states[Math.floor(Math.random() * states.length)];
		target = states[Math.floor(Math.random() * states.length)];
		shortestPath = findShortestPath(start, target);

		// !shortestPath is null case
		// choose a state that is at least 3 away and 6 at most
		// >7 or <4 ensures avoids adjacent picks
	} while (!shortestPath || shortestPath.length > 7 || shortestPath.length < 4);

	console.log('shortestPath length (includes start, target):', shortestPath.length);
	console.log('shortestPath length (excludes start, target):', shortestPath.length - 2);

	// return object literal
	return { start, target, length: shortestPath.length - 2 }; // subtract 1 to exclude start state. don't need 2? verify later
}

// Function to sync the prompt and map render time
export function checkLoadingComplete() {
	if (get(mapLoaded) && get(statesLoaded)) {
		if (!loadingDelayApplied) {
			loadingDelayApplied = true;
			setTimeout(() => {
				isLoading.set(false);
			}, 800);
		} else {
			isLoading.set(false);
		}
	}
}

// Function to clean the user input
export function formatStateName(state: string): string {
	return state
		.trim()
		.split(/\s+/) // Split by spaces
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
		.join(' '); // Rejoin into a proper state name
}

// Function to reset states to avoid forced reload
function resetGame() {
	// Reset guessed states
	guessedStates.set([]);

	// Reset guess count
	guessCount.set(0);

	// Generate new start & target states
	const { start, target, length } = getRandomStatePair();
	startState.set(start);
	targetState.set(target);
	initialGuessesRemaining.set(length + 3);

	console.log('Game reset without reload!');
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

// Function to check if the guessed path is a valid path from start to target
// Note: guesses can be out of order but must be connected
function isValidAlternativePath(guessed: string[], start: string, target: string): boolean {
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
		for (const neighbor of statesGraph[currentState] || []) {
			if (!visited.has(neighbor) && guessedSet.has(neighbor)) {
				queue.push(neighbor);
			}
		}
	}

	// If BFS couldn't reach the target, return false
	return false;
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
		// const isValidPath = isValidAlternativePath($guessedStates, $startState, $targetState);

		// Win Condition #1 (optimal): findShortestPath generated shortest path
		if (
			intermediateStates.length > 0 && // Ensure BFS path has intermediates
			containsAllElements(intermediateStates, $guessedStates) && // Ensure all BFS states are guessed
			currentGuessCount === optimalGuesses // Ensure player used the exact number of guesses
		) {
			console.log(`Optimal win triggered`);
			return {
				status: 'win',
				message: `Win Triggered: Condition - Found BFS optimal path. Optimal path: ${shortestPath.join(' → ')}`
			};
		}

		// Win Condition #2 (optimal): Same length as findShortestPath generated path
		if (
			isValidAlternativePath($guessedStates, $startState, $targetState) &&
			currentGuessCount === optimalGuesses
		) {
			console.log('Alternative optimal win triggered');
			return {
				status: 'win',
				message: `Win Triggered: Condition - Found another optimal path. Optimal path: ${shortestPath.join(' → ')}`
			};
		}

		// Win Condition #3 (sub-optimal): check alternative valid paths
		if (
			isValidAlternativePath($guessedStates, $startState, $targetState) &&
			currentGuessCount > optimalGuesses &&
			currentGuessCount <= maxGuesses
		) {
			console.log('Sub-optimal win triggered');
			return {
				status: 'sub-win',
				message: `Win Triggered: Condition - Found sub optimal path. Optimal path: ${shortestPath.join(' → ')}`
			};
		}

		// Lose Condition: If guesses exceed maxGuesses
		if (currentGuessCount === maxGuesses) {
			console.log('Loss triggere');
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
