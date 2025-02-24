import { writable, derived } from 'svelte/store';
import { statesGraph } from './statesGraph';
import { startState, targetState, guessedStates } from './stores';

/* 
    TODO: implement sub optimal win condition
        - optimal: shortest path guess (done)
        - sub-optimal: any other path guess that connects within +3 guesses
        - lose: exceed max guesses (done)

    NOTE:
        - should optimal condition be shortestPath.length() so it's number based?
        - then, sub-optimal condition is shortestPath.length() + 1 to shortestPath.length() + 3
        - lastly, lose condition is > shortestPath.length() + 3
*/

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

// Deriving game status dynamically
export const gameStatus = derived(
	[startState, targetState, guessedStates],
	([$startState, $targetState, $guessedStates]) => {
		if (!$startState || !$targetState) return { status: 'waiting', message: '' };

		const shortestPath = findShortestPath($startState, $targetState);
		if (!shortestPath) {
			console.error(`No valid path found from ${$startState} to ${$targetState}`); // won't happen after prompt fix
			return { status: 'error', message: `No valid path from ${$startState} to ${$targetState}` };
		}

		console.log(
			`Shortest Path from ${$startState} to ${$targetState}: ${shortestPath.join(' → ')}`
		);
		console.log(`Guessed States: ${$guessedStates.join(' → ')}`);

		const minSteps = shortestPath.length - 2; // -2 to exclude start and target
		console.log('minSteps: ', minSteps);
		const maxGuesses = minSteps + 1;
		console.log('maxGuesses: ', maxGuesses);
		const guessesRemaining = maxGuesses - $guessedStates.length;

		// Extract the in-between states in the shortest path
		const intermediateStates = shortestPath.slice(1, -1); // Remove start and target

		// Check if all in-between states are guessed, regardless of order
		const isShortestPath = containsAllElements(intermediateStates, $guessedStates);

		// Win condition: all in-between states must be guessed, in any order
		if (isShortestPath) {
			return {
				status: 'win',
				message: `Win Triggered: Condition - Found optimal path. Optimal path: ${shortestPath.join(' → ')}`
			};
		}

		// Lose condition: if there are no guesses left, trigger loss immediately
		if (guessesRemaining === 0) {
			return {
				status: 'lose',
				message: `Loss Triggered: Condition - No guesses remaining. Optimal path: ${shortestPath.join(' → ')}`
			};
		}

		return {
			status: 'playing',
			message: `Keep guessing! ${guessesRemaining} guesses left.`
		};
	}
);
