<script lang="ts">
	import { guessedStates } from '../stores';
</script>

{#if $guessedStates.length > 0}
	<div class="flex flex-col items-center text-center w-full max-w-md">
		<h4 class="h4 mb-2">past guesses:</h4>

		<!-- Guesses Grid -->
		<div class="flex flex-wrap justify-center gap-2 mb-2">
			{#each $guessedStates as guess}
				<div class="w-[130px] bg-primary-500 text-white text-center p-2 rounded-md">
					{guess}
				</div>
			{/each}
		</div>
	</div>
{/if}
