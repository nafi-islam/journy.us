<script lang="ts">
	// past guesses with the guess guide (🟩 on a shortest path, 🟧 next to one, 🟥 out of the way)
	import { findAllShortestPaths } from '#lib/engine/search.ts';
	import { getGuessScore, type GuessScore } from '#lib/engine/rules.ts';
	import { game } from '#lib/game.svelte.ts';

	const iconMap: Record<GuessScore, string> = {
		green: '🟩',
		orange: '🟧',
		red: '🟥'
	};

	const allShortestPaths = $derived(findAllShortestPaths(game.start, game.target, game.graph));

	const labeledGuesses = $derived(
		game.guessedStates.map((guess) => ({
			guess,
			icon: iconMap[getGuessScore(guess, allShortestPaths, game.graph)]
		}))
	);
</script>

{#if game.guessedStates.length > 0}
	<section class="flex w-full max-w-md flex-col items-center gap-3">
		<h4 class="h5 opacity-80">past guesses:</h4>

		<!-- Guesses Grid -->
		<ul class="grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
			{#each labeledGuesses as { guess, icon } (guess)}
				<li
					data-testid="guess-chip"
					class="animate-pop-in flex items-center justify-center gap-2 rounded-base border border-surface-200-800 bg-surface-100-900 px-3 py-2 text-sm font-medium shadow-sm"
				>
					<span aria-hidden="true">{icon}</span>
					<span>{guess}</span>
				</li>
			{/each}
		</ul>
	</section>
{/if}
