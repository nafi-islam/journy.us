<script lang="ts">
	import { onMount } from 'svelte';
	import {
		startState,
		targetState,
		pathLength,
		statesLoaded,
		isLoading,
		practiceMode,
		dailyStartState,
		dailyTargetState,
		dailyPathLength,
		dailyDate
	} from '../stores';
	import { checkLoadingComplete, getRandomStatePair } from '$lib/utils';

	function setDailyChallenge() {
		const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
		console.log('today’s date:', today);

		// Get the last stored daily challenge date
		const lastDailyDate = $dailyDate;

		// If no challenge exists for today, generate a new one
		if (lastDailyDate !== today) {
			const { start, target, length } = getRandomStatePair();
			dailyStartState.set(start);
			dailyTargetState.set(target);
			dailyPathLength.set(length);
			dailyDate.set(today);
		}

		// Set the states for the daily challenge
		startState.set($dailyStartState);
		targetState.set($dailyTargetState);
		pathLength.set($dailyPathLength);
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
		setPracticeMode();
	} else {
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
