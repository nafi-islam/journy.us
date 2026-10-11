// svelte glue between the stores and the game engine (src/lib/engine)
// the game logic itself lives in the engine so it can be tested without svelte

import { derived, get } from 'svelte/store';
import { evaluateGame } from './engine/rules';
import { getRandomStatePair } from './engine/practice';
import { statesGraph } from './engine/statesGraph';
import {
	startState,
	targetState,
	guessedStates,
	guessCount,
	initialGuessesRemaining,
	isLoading,
	mapLoaded,
	statesLoaded,
	modalShownPractice,
	puzzleGraph
} from './stores';

let loadingDelayApplied = false;

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

// Function to reset states to avoid forced reload
export function resetGame() {
	// Reset guessed states
	guessedStates.set([]);

	// Reset guess count
	guessCount.set(0);

	// Generate new start & target states (practice always uses the current graph)
	const { start, target, length } = getRandomStatePair();
	puzzleGraph.set(statesGraph);
	startState.set(start);
	targetState.set(target);
	initialGuessesRemaining.set(length + 3);

	modalShownPractice.set(false);
}

// Deriving game status dynamically (rules live in engine/rules.ts)
export const gameStatus = derived(
	[startState, targetState, guessedStates, puzzleGraph],
	([$startState, $targetState, $guessedStates, $puzzleGraph]) => {
		const evaluation = evaluateGame($startState, $targetState, $guessedStates, $puzzleGraph);

		// keep the button counters in sync (as v1 did). m3 replaces these stores with runes
		if (evaluation.status !== 'waiting' && evaluation.status !== 'error') {
			initialGuessesRemaining.set(evaluation.maxGuesses);
			guessCount.set($guessedStates.length);
		}

		return evaluation;
	}
);
