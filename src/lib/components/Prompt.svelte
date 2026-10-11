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
		modalShownDaily,
		puzzleGraph
	} from '../stores';
	import { checkLoadingComplete } from '$lib/utils';
	import { getRandomStatePair } from '$lib/engine/practice';
	import { statesGraph } from '$lib/engine/statesGraph';
	import {
		getGeneratedPuzzle,
		getLegacyPuzzle,
		getTodayKey,
		isLegacyDate,
		type DailyPuzzle
	} from '$lib/engine/daily';
	import { ensureStorageVersion, loadDailyProgress } from '$lib/engine/storage';
	import { evaluateGame, isGameOver } from '$lib/engine/rules';
	import { get } from 'svelte/store';

	function resetGameState() {
		guessedStates.set([]);
		guessCount.set(0);
		showPlayAgain.set(false);
	}

	// Load today's challenge (v1 json before SWITCH_DATE, generated from the date after)
	async function setDailyChallenge() {
		resetGameState();

		const today = getTodayKey(); // YYYY-MM-DD format

		try {
			let todayChallenge: DailyPuzzle | null;

			if (isLegacyDate(today)) {
				const res = await fetch('/validChallenges.json');
				todayChallenge = getLegacyPuzzle(today, await res.json());
			} else {
				todayChallenge = getGeneratedPuzzle(today);
			}

			if (todayChallenge) {
				const { start, target, shortestPath, graph } = todayChallenge;
				const length = shortestPath.length - 2;

				// legacy puzzles were generated with the v1 graph (four corners included)
				puzzleGraph.set(graph);
				startState.set(start);
				targetState.set(target);
				pathLength.set(length);

				dailyStartState.set(start); // Avoid refetching JSON
				dailyTargetState.set(target);
				dailyPathLength.set(length);
				dailyShortestPath.set(shortestPath);

				// debug: console.log('daily path:', shortestPath.join(' -> '));

				startState.set(get(dailyStartState));
				targetState.set(get(dailyTargetState));
			} else {
				console.error(`No challenge found for ${today}`);
			}
		} catch (error) {
			console.error('Failed to load the daily challenge:', error);
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
		await setDailyChallenge();
		restoreDailyProgress();

		// sets practice button when switching between practice and daily mode
		// only a *finished* daily counts as played today (v1 bug 9: any saved guess turned the
		// guess button into practice after a reload)
		const todayProgress = loadDailyProgress(getTodayKey());
		const todayStatus = evaluateGame(
			get(dailyStartState),
			get(dailyTargetState),
			todayProgress?.guessedStates ?? [],
			get(puzzleGraph)
		).status;
		showPractice.set(!!todayProgress && isGameOver(todayStatus));

		// Force reset from stored values
		startState.set(get(dailyStartState));
		targetState.set(get(dailyTargetState));
		guessedStates.set(get(dailyGuessedStates));
		guessCount.set(get(dailyGuessCount));
	}

	async function restoreDailyProgress() {
		// loads today's progress and cleans up older days
		const todayProgress = loadDailyProgress(getTodayKey());

		// Restore today’s progress
		if (todayProgress && !$practiceMode) {
			// the result modal was already shown for today's daily, don't replay it
			modalShownDaily.set(!!todayProgress.resultSeen);

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
		ensureStorageVersion(); // marks journyStorageVersion, never rewrites v1 data

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
