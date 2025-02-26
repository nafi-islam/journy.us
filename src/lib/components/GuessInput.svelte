<script lang="ts">
	import {
		Autocomplete,
		initializeStores,
		popup,
		type ToastSettings
	} from '@skeletonlabs/skeleton';
	import type { AutocompleteOption, PopupSettings } from '@skeletonlabs/skeleton';
	import { statesGraph } from '../statesGraph';
	import {
		guessCount,
		guessedStates,
		initialGuessesRemaining,
		startState,
		targetState
	} from '../stores';
	import { formatStateName } from '../utils';

	import { Toast, getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	let popupSettings: PopupSettings = {
		event: 'focus-click',
		target: 'popupAutocomplete',
		placement: 'top'
	};

	let inputPopupDemo: string = '';

	function onPopupDemoSelect(event: any): void {
		inputPopupDemo = event.detail.label;
	}

	function errorToastToggle() {
		const toast: ToastSettings = {
			message: '🚨 invalid state name!',
			background: 'variant-filled-error',
			timeout: 3000
		};
		toastStore.trigger(toast);
		console.log('toast clicked');
		console.log('toast message', toast.message);
	}

	// Submit Guess with Validation & Toast Notification
	function submitGuess() {
		if (inputPopupDemo.trim() !== '') {
			const formattedGuess = formatStateName(inputPopupDemo);

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

			inputPopupDemo = ''; // Clear input after guessing
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

<div class="flex flex-col space-y-4 w-full max-w-md">
	<!-- Guess Input and Button -->
	<div class="flex w-full space-x-2">
		<!-- Guess Input Field -->
		<!-- Added focus: ring-primary-500 focus:border-primary-500 -->
		<input
			class="input autocomplete w-full p-3 border rounded-md shadow-md focus:ring-primary-500 focus:border-primary-500"
			type="search"
			name="autocomplete-search"
			bind:value={inputPopupDemo}
			placeholder="Enter a state..."
			use:popup={popupSettings}
		/>

		<!-- Guess Button -->
		<button
			class="btn bg-primary-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-primary-800"
			on:click={submitGuess}
		>
			Guess ({$guessCount + 1} / {$initialGuessesRemaining})
		</button>
	</div>

	<!-- Autocomplete Dropdown -->
	<!-- Added border border-surface-200 shadow-lg -->
	<div
		data-popup="popupAutocomplete"
		class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto absolute left-0 top-full z-50 rounded-md bg-surface-50 border border-surface-200 shadow-lg"
		tabindex="-1"
	>
		<Autocomplete
			bind:input={inputPopupDemo}
			options={filteredStates}
			on:selection={onPopupDemoSelect}
		/>
	</div>
</div>
