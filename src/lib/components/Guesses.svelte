<script lang="ts">
	import { findAllShortestPaths, getGuessScore } from '$lib/utils';
	import { guessedStates, startState, targetState } from '../stores';

	let labeledGuesses = [];

	$: allShortestPaths = findAllShortestPaths($startState, $targetState);

	$: labeledGuesses = $guessedStates.map((guess) => {
		const score = getGuessScore(guess, allShortestPaths);
		const iconMap = {
			green: '🟩',
			orange: '🟧',
			red: '🟥'
		};

		return {
			guess,
			icon: iconMap[score]
		};
	});
</script>

{#if $guessedStates.length > 0}
	<div class="flex flex-col items-center text-center w-full max-w-md">
		<h4 class="h4 mb-2">past guesses:</h4>

		<!-- Guesses Grid -->
		<div class="flex flex-wrap justify-center gap-2 mb-2">
			{#each labeledGuesses as { guess, icon }}
				<div class="w-[140px] bg-primary-500 text-white text-center p-2 rounded-md">
					<span>{icon}</span> <span>{guess}</span>
				</div>
			{/each}
		</div>
	</div>
{/if}
