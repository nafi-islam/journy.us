<script lang="ts">
	import { getModalStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings } from '@skeletonlabs/skeleton';
	import PracticeModal from '$lib/components/PracticeModal.svelte';
	import DailyChallengeModal from '$lib/components/DailyChallengeModal.svelte';
	import { loadStats, saveStats } from '$lib/statistics';
	import {
		dailyPathLength,
		guessedStates,
		modalShownDaily,
		modalShownPractice,
		practiceMode,
		showPractice,
		startState,
		targetState
	} from '../stores';
	import { gameStatus } from '../utils';
	import { get } from 'svelte/store';

	const modalStore = getModalStore();

	// Function to trigger confetti when the user wins
	let cachedConfetti: any;

	async function triggerConfetti() {
		if (!cachedConfetti) {
			cachedConfetti = (await import('canvas-confetti')).default;
		}

		cachedConfetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.8 }
		});

		// Trigger light haptic feedback on supported devices
		if (navigator.vibrate) {
			navigator.vibrate(200);
		}
	}

	// Function to open the result modal when the game ends
	$: {
		if (
			($gameStatus.status === 'win' ||
				$gameStatus.status === 'sub-win' ||
				$gameStatus.status === 'lose') &&
			!get($practiceMode ? modalShownPractice : modalShownDaily)
		) {
			if ($practiceMode) {
				modalShownPractice.set(true);
			} else {
				modalShownDaily.set(true);
				showPractice.set(true); // makes sure that hasPlayedToday evaluates correctly ---> button becomes practice after playing (even if user escapes or clicks out of the modal)
			}

			if ($gameStatus.status === 'win' || $gameStatus.status === 'sub-win') {
				triggerConfetti();
				// console.log('confetti triggered');
			}

			setTimeout(() => {
				resultModalToggle();
			}, 500);
		}
	}

	function resultModalToggle() {
		const isPractice = $practiceMode;

		const modal: ModalSettings = {
			type: 'component',
			component: {
				ref: isPractice ? PracticeModal : DailyChallengeModal,
				props: {
					startState: $startState,
					targetState: $targetState,
					gameStatus: $gameStatus.status
				}
			}
		};

		modalStore.trigger(modal);
	}

	function recordDailyResult() {
		const today = new Date().toISOString().split('T')[0];
		const stats = loadStats();

		stats[today] = {
			won: $gameStatus.status === 'win' || $gameStatus.status === 'sub-win',
			guessCount: $guessedStates.length,
			shortestPathLength: get(dailyPathLength),
			isDaily: true,
			status: $gameStatus.status
		};

		saveStats(stats);
	}

	$: if (
		!$practiceMode &&
		($gameStatus.status === 'win' ||
			$gameStatus.status === 'sub-win' ||
			$gameStatus.status === 'lose')
	) {
		recordDailyResult();
	}
</script>
