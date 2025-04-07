<script lang="ts">
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import {
		showPractice,
		dailyShortestPath,
		dailyStartState,
		dailyTargetState,
		practiceMode,
		showPlayAgain,
		dailyGuessedStates,
		guessedStates
	} from '../stores';
	import { loadStats } from '$lib/statistics';
	import { onMount } from 'svelte';
	import { ChartBar } from 'tabler-icons-svelte';
	import { findAllShortestPaths, getGuessScore, resetGame } from '$lib/utils';
	import { Copy } from 'tabler-icons-svelte';
	import { get } from 'svelte/store';

	const modalStore = getModalStore();

	// Assuming validChallenges.json starts on 2025-03-26
	const challengeStartDate = new Date('2025-04-07');
	const today = new Date();
	const challengeNumber =
		Math.floor((today.getTime() - challengeStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

	function enterPracticeMode() {
		practiceMode.set(true);
		//console.log('practice mode:', $practiceMode);
		showPractice.set(false);
		showPlayAgain.set(false);
		resetGame();
		modalStore.close();
	}

	function DailyChallengeModalToggle() {
		modalStore.close();
		showPractice.set(true);
		//console.log('daily challenge modal triggered');
	}

	let statsForToday: { won: any; guessCount: any; shortestPathLength: any } | null = null;
	let aggregateStats = {
		gamesPlayed: 0,
		winRate: 0,
		currentStreak: 0,
		maxStreak: 0,
		guessDistribution: Array(8).fill(0)
	};

	onMount(() => {
		const today = new Date().toISOString().split('T')[0];
		const stats = loadStats();

		// Show only if played today
		statsForToday = stats[today];

		// Compute all-time stats
		const dates = Object.keys(stats).sort();
		let streak = 0;
		let maxStreak = 0;
		let winCount = 0;

		for (const date of dates) {
			const entry = stats[date];
			if (!entry) continue;

			aggregateStats.gamesPlayed++;

			if (entry.won && entry.isDaily) {
				winCount++;
				streak++;

				const index = entry.guessCount - 1;
				if (index >= 0 && index < aggregateStats.guessDistribution.length) {
					aggregateStats.guessDistribution[index]++;
				}
			} else {
				streak = 0;
			}

			if (streak > maxStreak) maxStreak = streak;
		}

		aggregateStats.winRate = Math.round((winCount / aggregateStats.gamesPlayed) * 100);
		aggregateStats.currentStreak = streak;
		aggregateStats.maxStreak = maxStreak;
	});

	// const toastStore = getToastStore();

	let copying = false;

	function copyShareMessage() {
		if (copying) return;
		copying = true;

		const challenge = challengeNumber;
		const guessesUsed = statsForToday?.guessCount ?? 0;
		//console.log('guessesUsed', guessesUsed);
		const totalGuesses = (statsForToday?.shortestPathLength ?? 3) + 3;
		//console.log('totalGuesses', totalGuesses);

		const guessesToShare = get(guessedStates);
		const start = get(dailyStartState);
		const target = get(dailyTargetState);

		const allPaths = findAllShortestPaths(start, target);

		const icons = guessesToShare
			.map((guess) => {
				const score = getGuessScore(guess, allPaths);
				if (score === 'green') return '🟩';
				if (score === 'orange') return '🟧';
				return '🟥';
			})
			.join('');

		const message = `journy #${challenge} ${guessesUsed}/${totalGuesses}\n${icons}\nhttps://www.journy.us/`;

		navigator.clipboard.writeText(message).then(() => {
			// toastStore.trigger({
			// 	message: '📋 copied to clipboard!',
			// 	background: 'variant-filled-primary',
			// 	timeout: 3000
			// });
			setTimeout(() => {
				copying = false;
			}, 2000); // wait 2s before re-enabling
		});
	}
</script>

<div class="modal-container p-6 rounded-xl shadow-lg bg-surface-100 dark:bg-surface-800">
	<!-- Header -->
	<div class="flex items-center justify-center gap-2 mb-4">
		<ChartBar size="24" />
		<h2 class="font-bold text-2xl text-center">Challenge #{challengeNumber}</h2>
	</div>

	{#if statsForToday}
		<h2 class="text-xl font-semibold text-center mb-4">
			{#if statsForToday.won}
				🎉 Congratulations!
			{:else}
				❌ Better luck next time!
			{/if}
		</h2>

		<!-- Win Message -->
		{#if statsForToday.won}
			<p class="text-center mb-4">
				Success! You got from <strong>{$dailyStartState}</strong> to
				<strong>{$dailyTargetState}</strong>
				in
				<strong>{statsForToday.guessCount}</strong> guesses.<br />
				The shortest solution was <strong>{statsForToday.shortestPathLength}</strong> guesses.
			</p>
		{/if}

		<!-- Lose Message -->
		{#if $dailyShortestPath.length && !statsForToday?.won}
			<p class="text-center mb-4">
				The shortest solution was <strong>{statsForToday.shortestPathLength}</strong> guesses.
				<br />
				{$dailyShortestPath.join(' ➡️ ')}
			</p>
		{/if}
	{/if}

	<div class="modal-body">
		<!-- Stats Overview -->
		<div class="flex flex-wrap sm:flex-nowrap justify-between text-center mb-6 gap-4">
			<div class="flex-1">
				<p class="text-2xl font-bold">{aggregateStats.gamesPlayed}</p>
				<p class="text-sm opacity-70">Played</p>
			</div>
			<div class="flex-1">
				<p class="text-2xl font-bold">{aggregateStats.winRate}%</p>
				<p class="text-sm opacity-70">Win Rate</p>
			</div>
			<div class="flex-1">
				<p class="text-2xl font-bold">{aggregateStats.currentStreak}</p>
				<p class="text-sm opacity-70">Current Streak</p>
			</div>
			<div class="flex-1">
				<p class="text-2xl font-bold">{aggregateStats.maxStreak}</p>
				<p class="text-sm opacity-70">Max Streak</p>
			</div>
		</div>

		<!-- Guess Distribution -->
		<div class="mb-6">
			<h4 class="font-semibold mb-2 text-center">Guess Distribution</h4>
			{#each aggregateStats.guessDistribution as count, index}
				<div class="flex items-center mb-1 gap-2">
					<span class="text-sm w-6">{index + 1}</span>
					<div
						class="{count === 0
							? 'bg-surface-300 dark:bg-surface-600 opacity-40'
							: 'bg-primary-500'} h-4 rounded-md transition-all"
						style="width: {Math.max(count * 12, 12)}px"
					></div>
					<span class="text-xs">{count}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Practice CTA -->
	<div class="text-center mt-2">
		<p>
			Want to practice more?
			<button
				on:click={enterPracticeMode}
				type="button"
				class="underline hover:text-primary-500 dark:hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 rounded"
			>
				Click here!
			</button>
		</p>
	</div>

	<!-- Share Button -->
	<div class="flex justify-center mt-4">
		<button
			on:click={copyShareMessage}
			class="btn bg-primary-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-primary-800 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
			disabled={copying}
		>
			<Copy size="16" />
			<span>{copying ? 'Copied!' : 'Share'}</span>
		</button>
	</div>

	<!-- Footer -->
	<div class="modal-footer">
		<button class="btn variant-ghost-surface" on:click={DailyChallengeModalToggle}>Close</button>
	</div>
</div>

<style>
	.modal-container {
		max-width: 600px;
		max-height: 80vh; /* max size */
		overflow-y: auto; /* scrolling */
		display: flex;
		flex-direction: column;
		margin: auto;
		position: relative;
	}

	.modal-body {
		flex-grow: 1; /* content expandable */
		max-height: 65vh; /* max overflow */
		overflow-y: auto;
		padding: 10px;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		padding-top: 1rem;
	}
</style>
