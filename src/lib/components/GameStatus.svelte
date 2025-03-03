<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import { startState, targetState, guessedStates, showPlayAgain } from '../stores';
	import { gameStatus } from '../utils';

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
			// console.log('confetti triggered');
		}
		setTimeout(() => {
			openResultModal();
		}, 500);
	}

	function openResultModal() {
		// Extract game details
		const guessedRoute =
			$guessedStates.length > 0 ? $guessedStates.join(' ➡️ ') : 'No route guessed';
		const idealRoute = $gameStatus.message.match(/Optimal path: (.*)/)?.[1] || 'N/A';

		// Define modal settings based on game outcome
		const modalContent: ModalSettings = {
			type: 'alert',
			title:
				$gameStatus.status === 'win'
					? '🎉 Congratulations, you won in the shortest path possible!'
					: $gameStatus.status === 'sub-win'
						? '✨ Congratulations, you won but there was a shorter path!'
						: '❌ Game Over',
			body: `
				<div class="text-lg text-center space-y-4 p-4">
					<p><strong>Your Route:</strong> <span class="text-primary-500" style="text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.5);">${$startState}  ➡️  ${guessedRoute}  ➡️  ${$targetState}</span></p>
					<p><strong>Shortest Route:</strong> <span class="text-secondary-600" style="text-shadow: 0.5px 0.5px 1px rgba(0, 0, 0, 0.5);">${idealRoute}</span></p>
				</div>
			`,
			backdropClasses: 'bg-black bg-opacity-100',
			modalClasses: 'p-6 rounded-xl shadow-lg bg-surface-100 dark:bg-surface-800',
			buttonTextCancel: 'Close',
			response: () => {
				// console.log('close or escape clicked');
				showPlayAgain.set(true); // change guess indicator to play again
			}
		};

		modalStore.trigger(modalContent);
	}
</script>
