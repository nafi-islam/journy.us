<script lang="ts">
	// daily challenge stats: today's result, all-time stats, guess distribution, share
	import IconChartBar from '@tabler/icons-svelte-runes/icons/chart-bar';
	import IconCopy from '@tabler/icons-svelte-runes/icons/copy';
	import Modal from './Modal.svelte';
	import { game } from '#lib/game.svelte.ts';
	import { findAllShortestPaths } from '#lib/engine/search.ts';
	import { getGuessScore } from '#lib/engine/rules.ts';
	import { getChallengeNumber } from '#lib/engine/dates.ts';
	import { getDailyGraph, getTodayKey } from '#lib/engine/daily.ts';
	import { computeStats } from '#lib/engine/stats.ts';
	import { loadDailyProgress, loadStats } from '#lib/engine/storage.ts';

	// challenge #1 was 2025-04-07 (see engine/dates.ts)
	const today = $derived(game.daily?.dateKey ?? getTodayKey());
	const challengeNumber = $derived(getChallengeNumber(today));

	// re-read localStorage whenever the dialog opens or a result is saved
	const history = $derived.by(() => {
		void game.dialog;
		void game.resultsVersion;
		return loadStats();
	});
	const statsForToday = $derived(history[today] ?? null);
	const aggregateStats = $derived(computeStats(history, today));
	const maxCount = $derived(Math.max(1, ...aggregateStats.guessDistribution));

	const statTiles = $derived([
		{ label: 'Played', value: `${aggregateStats.gamesPlayed}` },
		{ label: 'Win Rate', value: `${aggregateStats.winRate}%` },
		{ label: 'Current Streak', value: `${aggregateStats.currentStreak}` },
		{ label: 'Max Streak', value: `${aggregateStats.maxStreak}` }
	]);

	let copying = $state(false);

	// Function to copy the share message (v1 format) with the saved daily guesses
	function copyShareMessage() {
		if (copying || !statsForToday) return;
		copying = true;

		const guessesUsed = statsForToday.guessCount;
		const totalGuesses = statsForToday.shortestPathLength + 3;

		// share the saved daily guesses, not the board on screen (v1 bug 10)
		const guessesToShare = loadDailyProgress(today)?.guessedStates ?? [];
		const dailyGraph = getDailyGraph(today);
		const start = game.daily?.start ?? '';
		const target = game.daily?.target ?? '';
		const allPaths = findAllShortestPaths(start, target, dailyGraph);

		const icons = guessesToShare
			.map((guess) => {
				const score = getGuessScore(guess, allPaths, dailyGraph);
				if (score === 'green') return '🟩';
				if (score === 'orange') return '🟧';
				return '🟥';
			})
			.join('');

		const message = `journy #${challengeNumber} ${guessesUsed}/${totalGuesses}\n${icons}\nhttps://www.journy.us/`;

		navigator.clipboard.writeText(message).then(() => {
			setTimeout(() => {
				copying = false;
			}, 2000); // wait 2s before re-enabling
		});
	}

	// Function to leave the stats and start practicing
	function enterPracticeMode() {
		game.dialog = null;
		game.setPracticeMode();
	}
</script>

<Modal name="stats" title="Challenge #{challengeNumber}">
	{#snippet icon()}
		<IconChartBar class="size-6 text-primary-500" />
	{/snippet}

	{#if statsForToday}
		<div class="space-y-2 text-center">
			<h3 class="h4">
				{#if statsForToday.won}
					🎉 Congratulations!
				{:else}
					❌ Better luck next time!
				{/if}
			</h3>

			<!-- Win Message -->
			{#if statsForToday.won}
				<p>
					Success! You got from <strong>{game.daily?.start}</strong> to
					<strong>{game.daily?.target}</strong>
					in <strong>{statsForToday.guessCount}</strong> guesses.<br />
					The shortest solution was <strong>{statsForToday.shortestPathLength}</strong> guesses.
				</p>
			{:else if game.daily}
				<!-- Lose Message -->
				<p>
					The shortest solution was <strong>{statsForToday.shortestPathLength}</strong> guesses.
					<br />
					{game.daily.shortestPath.join(' ➡️ ')}
				</p>
			{/if}
		</div>
	{/if}

	<!-- Stats Overview -->
	<div class="grid grid-cols-4 gap-2 text-center">
		{#each statTiles as tile (tile.label)}
			<div class="rounded-base bg-surface-100-900 px-1 py-3" data-testid="stat-{tile.label}">
				<p class="text-2xl font-bold">{tile.value}</p>
				<p class="text-xs leading-tight opacity-70">{tile.label}</p>
			</div>
		{/each}
	</div>

	<!-- Guess Distribution -->
	<div class="space-y-1">
		<h4 class="text-center font-semibold">Guess Distribution</h4>
		{#each aggregateStats.guessDistribution as count, index (index)}
			{@const isToday = statsForToday?.won && statsForToday.guessCount === index + 1}
			<div class="flex items-center gap-2 text-sm">
				<span class="w-4 text-right opacity-70">{index + 1}</span>
				<div class="h-5 flex-1">
					<div
						class="flex h-full min-w-6 items-center justify-end rounded-base px-1.5 text-xs font-semibold transition-all {count ===
						0
							? 'bg-surface-200-800 opacity-60'
							: isToday
								? 'preset-filled-secondary-500'
								: 'preset-filled-primary-500'}"
						style="width: {(count / maxCount) * 100}%"
					>
						{count}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Practice CTA -->
	<p class="text-center">
		Want to practice more?
		<button type="button" class="anchor underline" onclick={enterPracticeMode}>Click here!</button>
	</p>

	<!-- Share Button -->
	{#if statsForToday && (statsForToday.won || statsForToday.guessCount > 0)}
		<div class="flex justify-center">
			<button
				type="button"
				class="btn preset-filled-primary-500 shadow-md"
				onclick={copyShareMessage}
				disabled={copying}
			>
				<IconCopy class="size-4" />
				<span>{copying ? 'Copied!' : 'Share'}</span>
			</button>
		</div>
	{/if}
</Modal>
