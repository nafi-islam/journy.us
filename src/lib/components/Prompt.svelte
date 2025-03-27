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
		dailyPathLength
	} from '../stores';
	import { checkLoadingComplete, getRandomStatePair } from '$lib/utils';

	// Load today's challenge from static JSON
	async function setDailyChallenge() {
		const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

		try {
			const res = await fetch('/validChallenges.json');
			const challenges = await res.json();

			const todayChallenge = challenges[today];

			if (todayChallenge) {
				startState.set(todayChallenge.dailyStartState);
				targetState.set(todayChallenge.dailyTargetState);
				pathLength.set(todayChallenge.dailyPathLength);
				dailyPathLength.set(todayChallenge.dailyPathLength); // avoid re-fetching json
			} else {
				console.error(`No challenge found for ${today}`);
			}
		} catch (error) {
			console.error('Failed to load validChallenges.json:', error);
		}
	}

	// Generate new practice mode states when toggled
	function setPracticeMode() {
		const { start, target, length } = getRandomStatePair();
		startState.set(start);
		targetState.set(target);
		pathLength.set(length);
	}

	onMount(() => {
		if ($practiceMode) {
			setPracticeMode();
		} else {
			setDailyChallenge();
		}

		// Mark state selection as loaded
		statesLoaded.set(true);
		checkLoadingComplete();
	});

	// Watch for mode changes and update the states accordingly
	$: if ($practiceMode) {
		guessedStates.set([]);
		guessCount.set(0);
		showPlayAgain.set(false);
		setPracticeMode();
	} else {
		guessedStates.set([]);
		guessCount.set(0);
		showPlayAgain.set(false);
		setDailyChallenge();
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
