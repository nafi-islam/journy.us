<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import PracticeModal from '$lib/components/PracticeModal.svelte';
	import { startState, targetState } from '../stores';
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
			resultModalToggle();
		}, 500);
	}

	function resultModalToggle() {
		const modal: ModalSettings = {
			type: 'component',
			component: {
				ref: PracticeModal,
				props: {
					startState: $startState,
					targetState: $targetState,
					gameStatus: $gameStatus.status
				}
			}
		};
		modalStore.trigger(modal);
	}
</script>
