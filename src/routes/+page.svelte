<script lang="ts">
	import { onMount } from 'svelte';
	import Prompt from '#lib/components/Prompt.svelte';
	import Map from '#lib/components/Map.svelte';
	import GuessInput from '#lib/components/GuessInput.svelte';
	import Guesses from '#lib/components/Guesses.svelte';
	import { game } from '#lib/game.svelte.ts';

	// the game only runs in the browser (the page itself is prerendered)
	onMount(() => {
		game.init();
	});
</script>

<div class="flex flex-col items-center gap-6 pt-4 pb-8 text-center">
	<!-- Prompt -->
	<Prompt />

	<!-- Map -->
	<Map />

	<!-- Guess Input -->
	<GuessInput />

	<!-- Guesses -->
	<Guesses />
</div>
