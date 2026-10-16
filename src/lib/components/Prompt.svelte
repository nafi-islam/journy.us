<script lang="ts">
	// the puzzle prompt ("your journy today is... to go from x to y")
	import { game } from '#lib/game.svelte.ts';
</script>

<div class="flex min-h-24 flex-col items-center justify-center gap-2">
	{#if game.isLoading}
		<h3 class="animate-pulse h4">finding your journy...</h3>
	{:else}
		<h2 class="h2">your journy {game.practiceMode ? 'now' : 'today'} is...</h2>
		<!-- each state gets a dot in its map color (orange start, green target) -->
		<h3 class="text-lg">
			to go from
			<span class="inline-flex items-center gap-1.5 font-semibold text-primary-700-300">
				<span class="size-2.5 rounded-full bg-primary-500" aria-hidden="true"></span>{game.start}
			</span>
			to
			<span class="inline-flex items-center gap-1.5 font-semibold text-secondary-800-200">
				<span class="size-2.5 rounded-full bg-secondary-500" aria-hidden="true"></span>{game.target}
			</span>
		</h3>
	{/if}
</div>
