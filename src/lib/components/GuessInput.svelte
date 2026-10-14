<script lang="ts">
	// the guess input (autocomplete) and the main button: guess / practice / play again
	import {
		Combobox,
		Portal,
		useListCollection,
		type ComboboxRootProps
	} from '@skeletonlabs/skeleton-svelte';
	import { game } from '#lib/game.svelte.ts';
	import { toaster } from '#lib/toaster.ts';
	import type { GuessCheck } from '#lib/engine/game.ts';

	let guessText = $state('');
	let guessButton: HTMLButtonElement | null = $state(null);

	// Filtered list: remove startState, targetState, and guessedStates, then match the input
	const options = $derived(
		Object.keys(game.graph)
			.filter(
				(state) =>
					state !== game.start && state !== game.target && !game.guessedStates.includes(state)
			)
			.sort()
	);
	const matches = $derived(
		options.filter((state) => state.toLowerCase().includes(guessText.trim().toLowerCase()))
	);
	const collection = $derived(
		useListCollection({
			items: matches,
			itemToString: (item) => item,
			itemToValue: (item) => item
		})
	);

	// button label (v1: "Guess (1 / 6)", then "Practice" after the daily, "Play Again" after practice)
	const buttonLabel = $derived.by(() => {
		if (game.showPlayAgain && game.practiceMode) return 'Play Again';
		if (game.hasPlayedToday) return 'Practice';
		const max = game.status.maxGuesses;
		return `Guess (${Math.min(game.guessedStates.length + 1, max)} / ${max})`;
	});

	// Function to show a toast for an invalid state name
	function errorToastToggle() {
		toaster.error({ title: '🚨 invalid state name!', duration: 3000 });
	}

	// Function to react to a guess (clear the input, or explain why it wasn't accepted)
	function handleCheck(check: GuessCheck | null) {
		if (!check) return; // the button started practice / play again

		if (check.ok) {
			guessText = ''; // Clear input after guessing
			return;
		}

		// Show a toast notification if invalid
		if (check.reason === 'invalid') errorToastToggle();

		// duplicates (and the start / target) are ignored and cleared, like v1 did for duplicates
		if (check.reason === 'duplicate' || check.reason === 'start-or-target') guessText = '';
	}

	// the enter key only ever guesses: once the game is over it does nothing (v1 bug 1)
	function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		handleCheck(game.submitGuess(guessText));
	}

	// the button guesses, starts practice after the daily, or plays again after practice
	async function onButtonClick() {
		handleCheck(await game.mainAction(guessText));
	}

	// picking a state from the list fills the input and moves focus to the guess button (v1)
	const onValueChange: ComboboxRootProps['onValueChange'] = (details) => {
		const picked = details.value[0];
		if (!picked) return;
		guessText = picked;
		setTimeout(() => guessButton?.focus(), 50);
	};
</script>

<form class="flex w-full max-w-md gap-2" onsubmit={onSubmit}>
	<!-- Guess Input Field -->
	<Combobox
		class="flex-1"
		{collection}
		inputValue={guessText}
		onInputValueChange={(details) => (guessText = details.inputValue)}
		{onValueChange}
		value={[]}
		allowCustomValue
		inputBehavior="none"
		selectionBehavior="replace"
		openOnClick
		positioning={{ placement: 'top-start', sameWidth: true }}
	>
		<Combobox.Control>
			<Combobox.Input
				placeholder="Enter a state..."
				aria-label="state guess"
				autocomplete="off"
				class="input"
			/>
		</Combobox.Control>
		<Portal>
			<Combobox.Positioner class="z-30">
				<Combobox.Content class="max-h-56 overflow-y-auto card bg-surface-50-950 shadow-xl">
					{#each matches as state (state)}
						<Combobox.Item item={state}>
							<Combobox.ItemText>{state}</Combobox.ItemText>
						</Combobox.Item>
					{/each}
				</Combobox.Content>
			</Combobox.Positioner>
		</Portal>
	</Combobox>

	<!-- Guess Button -->
	<button
		bind:this={guessButton}
		type="button"
		onclick={onButtonClick}
		data-testid="main-button"
		class="btn min-w-28 border border-primary-500 text-primary-700-300 transition-colors hover:preset-filled-primary-500 disabled:opacity-50"
		disabled={game.isLoading}
	>
		{buttonLabel}
	</button>
</form>
