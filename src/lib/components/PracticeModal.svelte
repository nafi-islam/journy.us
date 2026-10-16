<script lang="ts">
	// practice result: your route vs the shortest route
	import Modal from './Modal.svelte';
	import { game } from '#lib/game.svelte.ts';

	const title = $derived.by(() => {
		if (game.status.status === 'win') return '🎉 Congratulations! You won in the shortest path!';
		if (game.status.status === 'sub-win') return '✨ You won, but there was a shorter path!';
		return '❌ Game Over';
	});

	const guessedRoute = $derived(
		game.guessedStates.length > 0 ? game.guessedStates.join(' ➡️ ') : 'No route guessed'
	);
	const idealRoute = $derived(game.status.shortestPath.join(' ➡️ ') || 'N/A');
</script>

<Modal name="practice-result" {title}>
	<!-- Routes Content -->
	<div class="space-y-3">
		<div>
			<p class="font-semibold">Your Route:</p>
			<p class="rounded-base bg-surface-100-900 p-3 font-semibold text-primary-600-400">
				{game.start} ➡️ {guessedRoute} ➡️ {game.target}
			</p>
		</div>
		<div>
			<p class="font-semibold">Shortest Route:</p>
			<p class="rounded-base bg-surface-100-900 p-3 font-semibold text-secondary-700-300">
				{idealRoute}
			</p>
		</div>
	</div>
</Modal>
