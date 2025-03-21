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
		showPlayAgain
	} from '../stores';
	import { statesGraph } from '../statesGraph';
	import { formatStateName, resetGame } from '../utils';

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
				if ($showPlayAgain) {
					showPlayAgain.set(false); // Reset state before calling resetGame
					resetGame();
				} else {
					submitGuess();
				}
			}}
			tabindex="0"
		>
			{#if $showPlayAgain}
				Play Again
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
