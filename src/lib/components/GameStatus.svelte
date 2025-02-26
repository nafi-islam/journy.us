<script lang="ts">
	import { gameStatus } from '../utils';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import { startState, targetState, guessedStates } from '../stores';
	import confetti from 'canvas-confetti';

	const modalStore = getModalStore();

	// Function to trigger confetti when the user wins
	async function triggerConfetti() {
		const confetti = (await import('canvas-confetti')).default; // Dynamically import
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.8 }
		});
	}

	// Function to open the result modal when the game ends
	$: if (
		$gameStatus.status === 'win' ||
		$gameStatus.status === 'sub-win' ||
		$gameStatus.status === 'lose'
	) {
		if ($gameStatus.status === 'win' || $gameStatus.status === 'sub-win') {
			triggerConfetti();
			console.log('confetti triggered');
		}
		setTimeout(() => {
			openResultModal();
		}, 1000);
	}

	function openResultModal() {
		// Extract game details
		const guessedRoute =
			$guessedStates.length > 0 ? $guessedStates.join(' → ') : 'No route guessed';
		const idealRoute = $gameStatus.message.match(/Optimal path: (.*)/)?.[1] || 'N/A';

		// Define modal settings based on game outcome
		// TODO: button style: colors, rounded, and hover
		const modalContent: ModalSettings = {
			type: 'confirm',
			title:
				$gameStatus.status === 'win'
					? '🎉 Congratulations, this was an optimal win!'
					: $gameStatus.status === 'sub-win'
						? '✨ Congratulations, this was a sub-optimal win!'
						: '❌ Game Over',
			body: `
				<div class="text-lg text-center">
					<p><strong>Your Route:</strong> <span class="text-primary-500" style="text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.5);">${$startState}  →  ${guessedRoute}  →  ${$targetState}</span></p>
					<p><strong>Our Optimal Route:</strong> <span class="text-secondary-500" style="text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.5);">${idealRoute}</span></p>
				</div>
			`,
			backdropClasses: 'bg-black bg-opacity-100',
			modalClasses: 'p-6 rounded-xl shadow-lg bg-surface-500 dark:bg-surface-500',
			buttonTextConfirm: 'Play Again',
			response: () => resetGame()
		};

		modalStore.trigger(modalContent);
	}

	// TODO: replace with some sort of query so you don't force a refresh -- SvelteQuery?
	function resetGame() {
		location.reload(); // page reload
	}
</script>
