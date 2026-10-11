<script lang="ts">
	import { onMount } from 'svelte';
	import {
		startState,
		targetState,
		pathLength,
		statesLoaded,
		isLoading,
		practiceMode,
		guessedStates,
		guessCount,
		showPlayAgain,
		dailyPathLength,
		dailyShortestPath,
		dailyTargetState,
		dailyStartState,
		dailyGuessedStates,
		dailyGuessCount,
		showPractice,
		modalShownPractice,
		puzzleGraph
	} from '../stores';
	import { checkLoadingComplete } from '$lib/utils';
	import { getRandomStatePair } from '$lib/engine/practice';
	import { statesGraph } from '$lib/engine/statesGraph';
	import { legacyStatesGraph, type LegacyChallenges } from '$lib/engine/legacy';
	import { utcDateKey } from '$lib/engine/dates';
	import { loadDailyProgress } from '$lib/engine/storage';
	import { get } from 'svelte/store';

	function resetGameState() {
		guessedStates.set([]);
		guessCount.set(0);
		showPlayAgain.set(false);
	}

	// Load today's challenge from static JSON
	async function setDailyChallenge() {
		resetGameState();

		const today = utcDateKey(); // YYYY-MM-DD format

		try {
			const res = await fetch('/validChallenges.json');
			const challenges: LegacyChallenges = await res.json();

			const todayChallenge = challenges[today];

			if (todayChallenge) {
				// legacy puzzles were generated with the v1 graph (four corners included)
				puzzleGraph.set(legacyStatesGraph);
				startState.set(todayChallenge.dailyStartState);
				targetState.set(todayChallenge.dailyTargetState);
				pathLength.set(todayChallenge.dailyPathLength);

				dailyStartState.set(todayChallenge.dailyStartState); // Avoid refetching JSON
				//console.log('dailyStartState:', todayChallenge.dailyStartState);
				dailyTargetState.set(todayChallenge.dailyTargetState);
				dailyPathLength.set(todayChallenge.dailyPathLength);
				dailyShortestPath.set(todayChallenge.shortestPath);

				// debug: console.log('daily path:', todayChallenge.shortestPath.join(' -> '));

				startState.set(get(dailyStartState));
				targetState.set(get(dailyTargetState));
			} else {
				console.error(`No challenge found for ${today}`);
			}
		} catch (error) {
			console.error('Failed to load validChallenges.json:', error);
		}
	}

	// Generate new practice mode states when toggled
	function setPracticeMode() {
		resetGameState();

		const { start, target, length } = getRandomStatePair();

		startState.set('');
		targetState.set('');
		guessedStates.set([]);

		puzzleGraph.set(statesGraph);
		startState.set(start);
		targetState.set(target);
		pathLength.set(length);

		modalShownPractice.set(false);
	}

	async function loadDailyChallengeAndProgress() {
		// sets practice button when switching between practice and daily mode
		const todayProgress = loadDailyProgress(utcDateKey());
		showPractice.set(!!todayProgress);

		await setDailyChallenge();
		restoreDailyProgress();

		// Force reset from stored values
		startState.set(get(dailyStartState));
		targetState.set(get(dailyTargetState));
		guessedStates.set(get(dailyGuessedStates));
		guessCount.set(get(dailyGuessCount));
	}

	async function restoreDailyProgress() {
		// loads today's progress and cleans up older days
		const todayProgress = loadDailyProgress(utcDateKey());

		// Restore today’s progress
		if (todayProgress && !$practiceMode) {
			// Store for reference (fine)
			dailyGuessedStates.set(todayProgress.guessedStates || []);
			dailyGuessCount.set(todayProgress.guessCount || 0);

			// But these are **required** for the UI to show them
			guessedStates.set(todayProgress.guessedStates || []);
			guessCount.set(todayProgress.guessCount || 0);

			//showPractice.set(todayProgress.won || false);
		}
	}

	onMount(() => {
		if ($practiceMode) {
			setPracticeMode();
		} else {
			loadDailyChallengeAndProgress();
		}

		statesLoaded.set(true);
		checkLoadingComplete();
	});

	let wasPracticeMode = false;

	$: {
		if (!wasPracticeMode && $practiceMode && $statesLoaded) {
			// just switched to practice: always start a new practice puzzle
			// (v1 bug 2: switching before any guess kept the daily puzzle and revealed its answer)
			setPracticeMode();
		}

		if (wasPracticeMode && !$practiceMode && $statesLoaded) {
			// just switched back to daily challenge
			loadDailyChallengeAndProgress(); // restore the challenge
		}

		wasPracticeMode = $practiceMode;
	}
</script>

<div class="flex flex-col items-center space-y-4 p-2">
	{#if $isLoading}
		<h3 class="h4 animate-pulse">finding your journy...</h3>
	{:else if $practiceMode}
		<h2 class="h2">your journy now is...</h2>
		<h3 class="h4">
			to go from <span class="font-semibold text-primary-600">{$startState}</span> to
			<span class="font-semibold text-secondary-600">{$targetState}</span>
		</h3>
	{:else}
		<h2 class="h2">your journy today is...</h2>
		<h3 class="h4">
			to go from <span class="font-semibold text-primary-600">{$startState}</span> to
			<span class="font-semibold text-secondary-600">{$targetState}</span>
		</h3>
	{/if}
</div>
