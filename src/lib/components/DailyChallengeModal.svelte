<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { startState, targetState, guessedStates } from '../stores';
	import { gameStatus } from '../utils';
	import { ChartBar } from 'tabler-icons-svelte';

	const modalStore = getModalStore();

	// Assuming validChallenges.json starts on 2025-03-26
	const challengeStartDate = new Date('2025-03-26');
	const today = new Date();
	const challengeNumber =
		Math.floor((today.getTime() - challengeStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

	function closeModal() {
		modalStore.close();
	}

	// Example stats (could be fetched from localStorage)
	const stats = {
		gamesPlayed: 17,
		winRate: 82,
		currentStreak: 3,
		maxStreak: 5,
		guessDistribution: [0, 1, 3, 6, 5, 2] // guess in n+1 attempts (e.g. 1 guess, 2 guesses, etc.)
	};
</script>

<div class="modal-container p-6 rounded-xl shadow-lg bg-surface-100 dark:bg-surface-800">
	<!-- Header -->
	<div class="flex items-center justify-center gap-2 mb-4">
		<ChartBar size="24" />
		<h2 class="font-bold text-2xl text-center">Challenge #{challengeNumber}</h2>
	</div>

	<!-- Outcome -->
	<h2 class="text-xl font-semibold text-center mb-4">
		{#if $gameStatus.status === 'win' || $gameStatus.status === 'sub-win'}
			🎉 Congratulations!
		{:else}
			❌ Better luck next time!
		{/if}
	</h2>

	<div class="modal-body">
		<!-- Stats Overview -->
		<div class="flex flex-wrap sm:flex-nowrap justify-between text-center mb-6 gap-4">
			<div class="flex-1">
				<p class="text-2xl font-bold">{stats.gamesPlayed}</p>
				<p class="text-sm opacity-70">Played</p>
			</div>
			<div class="flex-1">
				<p class="text-2xl font-bold">{stats.winRate}%</p>
				<p class="text-sm opacity-70">Win Rate</p>
			</div>
			<div class="flex-1">
				<p class="text-2xl font-bold">{stats.currentStreak}</p>
				<p class="text-sm opacity-70">Current Streak</p>
			</div>
			<div class="flex-1">
				<p class="text-2xl font-bold">{stats.maxStreak}</p>
				<p class="text-sm opacity-70">Max Streak</p>
			</div>
		</div>

		<!-- Guess Distribution -->
		<div class="mb-6">
			<h4 class="font-semibold mb-2 text-center">Guess Distribution</h4>
			{#each stats.guessDistribution as count, index}
				<div class="flex items-center mb-1 gap-2">
					<span class="text-sm w-6">{index + 1}</span>
					<div
						class="bg-primary-500 h-4 rounded-md transition-all"
						style="width: {count * 12}px"
					></div>
					<span class="text-xs">{count}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Footer -->
	<div class="modal-footer">
		<button class="btn variant-ghost-surface" on:click={closeModal}>Close</button>
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
