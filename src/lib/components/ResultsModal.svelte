<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { startState, targetState, guessedStates, showPlayAgain } from '../stores';
	import { gameStatus } from '../utils';

	const modalStore = getModalStore();

	// Extract game details
	const guessedRoute = $guessedStates.length > 0 ? $guessedStates.join(' ➡️ ') : 'No route guessed';
	const idealRoute = $gameStatus.message.match(/Optimal path: (.*)/)?.[1] || 'N/A';

	function closeModal() {
		modalStore.close();
		showPlayAgain.set(true);
	}
</script>

<!-- Results Modal -->
<div class="modal-container p-6 rounded-xl shadow-lg bg-surface-100 dark:bg-surface-800">
	<h2 class="font-bold text-2xl text-center">
		{#if $gameStatus.status === 'win'}
			🎉 Congratulations! You won in the shortest path!
		{:else if $gameStatus.status === 'sub-win'}
			✨ You won, but there was a shorter path!
		{:else}
			❌ Game Over
		{/if}
	</h2>

	<!-- Routes Content -->
	<div class="modal-body">
		<p><strong>Your Route:</strong></p>
		<div class="route-text text-primary-500 font-semibold">
			{$startState} ➡️ {guessedRoute} ➡️ {$targetState}
		</div>

		<p><strong>Shortest Route:</strong></p>
		<div class="route-text text-secondary-600 font-semibold">
			{idealRoute}
		</div>
	</div>

	<!-- Button Section -->
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

	.route-text {
		white-space: normal;
		word-wrap: break-word;
		overflow-wrap: break-word;
		display: block;
		/* text-align: center; */
		padding: 10px;
		border-radius: 6px;
	}
</style>
