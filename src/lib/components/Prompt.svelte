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
		modalShownPractice
	} from '../stores';
	import { checkLoadingComplete, gameStatus, getRandomStatePair } from '$lib/utils';
	import { get } from 'svelte/store';

	function resetGameState() {
		guessedStates.set([]);
		guessCount.set(0);
		showPlayAgain.set(false);
	}

	// Load today's challenge from static JSON
	async function setDailyChallenge() {
		resetGameState();

		const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

		try {
			const res = await fetch('/validChallenges.json');
			const challenges = await res.json();

			const todayChallenge = challenges[today];

			if (todayChallenge) {
				startState.set(todayChallenge.dailyStartState);
				targetState.set(todayChallenge.dailyTargetState);
				pathLength.set(todayChallenge.dailyPathLength);

				dailyStartState.set(todayChallenge.dailyStartState); // Avoid refetching JSON
				//console.log('dailyStartState:', todayChallenge.dailyStartState);
				dailyTargetState.set(todayChallenge.dailyTargetState);
				dailyPathLength.set(todayChallenge.dailyPathLength);
				dailyShortestPath.set(todayChallenge.shortestPath);

				const consoleAnswer = todayChallenge.shortestPath.join(' -> ');
				//console.log('debug, path:', consoleAnswer);

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

		startState.set(start);
		targetState.set(target);
		pathLength.set(length);

		modalShownPractice.set(false);
	}

	async function loadDailyChallengeAndProgress() {
		await setDailyChallenge();
		restoreDailyProgress();

		// Force reset from stored values
		startState.set(get(dailyStartState));
		targetState.set(get(dailyTargetState));
		guessedStates.set(get(dailyGuessedStates));
		guessCount.set(get(dailyGuessCount));
	}

	async function restoreDailyProgress() {
		const today = new Date().toISOString().split('T')[0];
		const stats = JSON.parse(localStorage.getItem('journyDailyStats') || '{}');

		// Clean up old progress
		for (const date in stats) {
			if (date !== today) delete stats[date];
		}
		localStorage.setItem('journyDailyStats', JSON.stringify(stats));

		// Restore today’s progress
		const todayProgress = stats[today];
		if (todayProgress && !$practiceMode) {
			// Store for reference (fine)
			dailyGuessedStates.set(todayProgress.guessedStates || []);
			dailyGuessCount.set(todayProgress.guessCount || 0);

			// But these are **required** for the UI to show them
			guessedStates.set(todayProgress.guessedStates || []);
			guessCount.set(todayProgress.guessCount || 0);

			showPractice.set(todayProgress.won || false);
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
			if ($showPlayAgain || $guessedStates.length > 0) {
				setPracticeMode(); // prevent the practice mode from getting wiped as they toggle back and forth
			}
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
