<script>
	import Prompt from '$lib/components/Prompt.svelte';
	import Map from '$lib/components/Map.svelte';
	import GuessInput from '$lib/components/GuessInput.svelte';
	import Guesses from '$lib/components/Guesses.svelte';
</script>

<div
	class="container min-h-screen mx-auto flex flex-col items-center justify-start overflow-y-auto"
>
	<div class="pt-2 space-y-8 text-center flex flex-col items-center">
		<h2 class="h2">your journy today is...</h2>

		<!-- Prompt -->
		<Prompt />

		<!-- Map -->
		<Map />

		<!-- Autocomplete -->
		<GuessInput />

		<!-- Guesses -->
		<Guesses />
	</div>
</div>
