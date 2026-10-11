<script lang="ts">
	// the puzzle prompt ("your journy today is... to go from x to y")
	import { game } from '#lib/game.svelte.ts';
</script>

<div class="flex min-h-24 flex-col items-center justify-center gap-2">
	{#if game.isLoading}
		<h3 class="animate-pulse h4">finding your journy...</h3>
	{:else}
		<h2 class="h2">your journy {game.practiceMode ? 'now' : 'today'} is...</h2>
		<h3 class="text-lg">
			to go from
			<span class="chip preset-filled-primary-500 text-base font-semibold">{game.start}</span>
			to
			<span class="chip preset-filled-secondary-500 text-base font-semibold">{game.target}</span>
		</h3>
	{/if}
</div>
