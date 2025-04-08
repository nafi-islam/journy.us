<script lang="ts">
	import { Autocomplete, popup, type ToastSettings } from '@skeletonlabs/skeleton';
	import type { PopupSettings } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import {
		guessCount,
		guessedStates,
		initialGuessesRemaining,
		startState,
		targetState,
		showPlayAgain,
		practiceMode,
		showPractice
	} from '../stores';
	import { statesGraph } from '../statesGraph';
	import { formatStateName, gameStatus, resetGame } from '../utils';
	import { derived, get } from 'svelte/store';

	// $: hasPlayedToday = $showPractice && !$practiceMode;

	const hasPlayedToday = derived(
		[showPractice, practiceMode],
		([$showPractice, $practiceMode]) => $showPractice && !$practiceMode
	);

	function enterPracticeMode() {
		practiceMode.set(true);
		// console.log('practice mode:', $practiceMode);
		resetGame(); // optional: regenerate new prompt
		// console.group('Practice Mode Logs'); // instagram reels taught me this, poggers
		// console.log('user completed challenge and clicked practice');
		// console.log('practice mode:', $practiceMode); // should be true
		// console.groupEnd();
	}

	const toastStore = getToastStore();

	let guessButton: HTMLButtonElement | null = null;

	let popupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'popupAutocomplete',
		placement: 'top'
	};

	let inputPopupError: string = '';

	function onPopupErrorSelect(event: any): void {
		inputPopupError = event.detail.label;

		setTimeout(() => {
			if (guessButton) guessButton.focus();
		}, 100);
	}

	function errorToastToggle() {
		const toast: ToastSettings = {
			message: '🚨 invalid state name!',
			background: 'variant-filled-error',
			timeout: 3000
		};
		toastStore.trigger(toast);
		// console.log('toast clicked');
		// console.log('toast message', toast.message);
	}

	function saveDailyProgress() {
		if (get(practiceMode)) return;

		const today = new Date().toISOString().split('T')[0];
		const stats = JSON.parse(localStorage.getItem('journyDailyStats') || '{}');

		stats[today] = {
			guessedStates: get(guessedStates),
			guessCount: get(guessCount),
			won: $gameStatus.status === 'win' || $gameStatus.status === 'sub-win',
			status: $gameStatus.status
		};

		localStorage.setItem('journyDailyStats', JSON.stringify(stats));
	}

	// Submit Guess with Validation & Toast Notification
	function submitGuess() {
		if (inputPopupError.trim() !== '') {
			const formattedGuess = formatStateName(inputPopupError);

			// Check if the formatted guess exists in statesGraph
			if (!(formattedGuess in statesGraph)) {
				// Show a toast notification if invalid
				errorToastToggle();
				return;
			}

			// Add valid guess if not already guessed
			guessedStates.update((guesses) => {
				if (!guesses.includes(formattedGuess)) {
					return [...guesses, formattedGuess];
				}
				return guesses;
			});

			saveDailyProgress();
			inputPopupError = ''; // Clear input after guessing
		}
	}

	// Filtered list: remove startState, targetState, and guessedStates
	$: filteredStates = Object.keys(statesGraph)
		.filter(
			(state) => state !== $startState && state !== $targetState && !$guessedStates.includes(state)
		)
		.map((state) => ({
			label: state,
			value: state
		}));
	// console.log('Autocomplete States:', states);
</script>

<div
	class="flex flex-col space-y-4 w-full max-w-md px-4 sm:px-6 md:px-8 mx-auto mt-4 sm:mt-6 md:mt-8"
>
	<!-- Guess Input and Button -->
	<div class="flex w-full space-x-2">
		<!-- Guess Input Field -->
		<!-- Added focus: ring-primary-500 focus:border-primary-500 -->
		<input
			class="input autocomplete w-full p-3 border rounded-md shadow-md focus:ring-primary-500 focus:border-primary-500"
			type="search"
			name="autocomplete-search"
			bind:value={inputPopupError}
			placeholder="Enter a state..."
			use:popup={popupSettings}
			on:keydown={(e) => e.key === 'Enter' && submitGuess()}
		/>

		<!-- Guess Button -->
		<button
			bind:this={guessButton}
			class="btn bg-primary-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-primary-800"
			on:click={() => {
				if ($showPlayAgain && $practiceMode) {
					showPlayAgain.set(false);
					resetGame();
				} else if (!$practiceMode && get(hasPlayedToday)) {
					enterPracticeMode();
				} else {
					submitGuess();
				}
			}}
			tabindex="0"
		>
			<!-- Using $hasPlayedToday vs get(hasPlayedToday) creates a breaking bug -->
			{#if $showPlayAgain}
				Play Again
			{:else if !$practiceMode && get(hasPlayedToday)}
				Practice
			{:else if $hasPlayedToday}
				Practice
			{:else}
				Guess ({Math.min($guessCount + 1, $initialGuessesRemaining)} / {$initialGuessesRemaining})
			{/if}
		</button>
	</div>

	<!-- Autocomplete Dropdown -->
	<div
		data-popup="popupAutocomplete"
		class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto absolute left-0 top-full z-50 rounded-md bg-surface-50 border border-surface-200 shadow-lg"
		tabindex="-1"
	>
		<Autocomplete
			bind:input={inputPopupError}
			options={filteredStates}
			on:selection={onPopupErrorSelect}
		/>
	</div>
</div>
